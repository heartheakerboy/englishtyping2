import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listExternalResources,
  upsertExternalResource,
  deleteExternalResource,
  listAnchorTexts,
  upsertAnchorText,
  deleteAnchorText,
  list404Logs,
  clear404Logs,
  listLinkAnalytics,
  listBrokenLinks,
  markBrokenLinkFixed,
  runBrokenLinkCheck,
} from "@/lib/linking-system.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";
import { Play, Trash2, CheckCircle2, RotateCcw, AlertTriangle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/linking")({
  component: LinkingPage,
});

const TRUSTED_CATEGORIES = [
  "Education",
  "Government",
  "Universities",
  "Typing Standards",
  "Keyboard Manufacturers",
  "Accessibility",
  "Programming",
  "Open Source",
  "Developer Documentation",
  "Browser Documentation",
  "Official Language Resources",
  "Unicode",
  "W3C",
  "MDN",
  "Microsoft",
  "Google",
  "Apple",
  "GitHub",
  "Stack Overflow",
];

type ExtRes = {
  id?: string;
  title: string;
  url: string;
  description?: string | null;
  logo_url?: string | null;
  category: string;
  country?: string | null;
  language?: string | null;
  is_dofollow: boolean;
  open_in_new_tab: boolean;
  is_sponsored: boolean;
  is_ugc: boolean;
  is_active: boolean;
  priority: number;
  tags: string[];
};

type AnchorText = {
  id?: string;
  keyword: string;
  target_url: string;
  is_active: boolean;
};

function LinkingPage() {
  const [activeTab, setActiveTab] = useState<"internal" | "external" | "broken" | "404" | "analytics">("internal");
  const [editingResource, setEditingResource] = useState<ExtRes | null>(null);
  const [editingAnchor, setEditingAnchor] = useState<AnchorText | null>(null);
  const [checking, setChecking] = useState(false);

  // External Resources Queries
  const fetchExts = useServerFn(listExternalResources);
  const saveExt = useServerFn(upsertExternalResource);
  const deleteExt = useServerFn(deleteExternalResource);
  const { data: extResources, refetch: refetchExts } = useQuery({
    queryKey: ["admin-ext-resources"],
    queryFn: () => fetchExts(),
  });

  // Anchor Texts Queries
  const fetchAnchors = useServerFn(listAnchorTexts);
  const saveAnchor = useServerFn(upsertAnchorText);
  const deleteAnchor = useServerFn(deleteAnchorText);
  const { data: anchorTexts, refetch: refetchAnchors } = useQuery({
    queryKey: ["admin-anchor-texts"],
    queryFn: () => fetchAnchors(),
  });

  // Broken Links Queries
  const fetchBroken = useServerFn(listBrokenLinks);
  const runCheck = useServerFn(runBrokenLinkCheck);
  const fixLink = useServerFn(markBrokenLinkFixed);
  const { data: brokenLinks, refetch: refetchBroken } = useQuery({
    queryKey: ["admin-broken-links"],
    queryFn: () => fetchBroken(),
  });

  // 404 Monitor Queries
  const fetch404 = useServerFn(list404Logs);
  const clear404 = useServerFn(clear404Logs);
  const { data: log404s, refetch: refetch404 } = useQuery({
    queryKey: ["admin-404-logs"],
    queryFn: () => fetch404(),
  });

  // Link Analytics Queries
  const fetchAnalytics = useServerFn(listLinkAnalytics);
  const { data: linkAnalytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ["admin-link-analytics"],
    queryFn: () => fetchAnalytics(),
  });

  // External Resource Handlers
  async function onSaveResource(r: ExtRes) {
    try {
      await saveExt({ data: r });
      toast.success("External resource saved");
      setEditingResource(null);
      refetchExts();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function onDeleteResource(id: string) {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteExt({ data: { id } });
      toast.success("Deleted");
      refetchExts();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // Anchor Text Handlers
  async function onSaveAnchor(a: AnchorText) {
    try {
      await saveAnchor({ data: a });
      toast.success("Keyword mapping saved");
      setEditingAnchor(null);
      refetchAnchors();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function onDeleteAnchor(id: string) {
    if (!confirm("Are you sure you want to delete this keyword mapping?")) return;
    try {
      await deleteAnchor({ data: { id } });
      toast.success("Deleted");
      refetchAnchors();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // Broken Link Check trigger
  async function handleRunLinkCheck() {
    setChecking(true);
    toast.info("Scanning site for broken links...");
    try {
      const res = await runCheck();
      toast.success(`Check finished. Checked ${res.checked} URLs.`);
      refetchBroken();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setChecking(false);
    }
  }

  async function handleMarkFixed(id: string) {
    try {
      await fixLink({ data: { id } });
      toast.success("Marked as fixed");
      refetchBroken();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleClearLogs() {
    if (!confirm("Clear all 404 error logs?")) return;
    try {
      await clear404();
      toast.success("Cleared logs");
      refetch404();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Linking & SEO System</h1>
          <p className="text-sm text-muted-foreground">
            Manage contextual internal linking, external resource connections, sitemap automation, and click metrics.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border/60">
        {(["internal", "external", "broken", "404", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "internal"
              ? "Anchor Mappings (Internal)"
              : tab === "broken"
                ? "Broken Links"
                : tab === "404"
                  ? "404 Monitor"
                  : tab === "analytics"
                    ? "Link Clicks"
                    : "External Resources"}
          </button>
        ))}
      </div>

      {/* Internal Anchor Text Tab */}
      {activeTab === "internal" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Anchor Text Manager</h2>
            <Button onClick={() => setEditingAnchor({ keyword: "", target_url: "/", is_active: true })}>
              Add Anchor Suggestion
            </Button>
          </div>

          <DataTable<AnchorText & { id: string }>
            rows={(anchorTexts ?? []) as any}
            search
            searchFields={["keyword", "target_url"]}
            columns={[
              {
                key: "keyword",
                header: "Keyword",
                cell: (row) => <span className="font-semibold">{row.keyword}</span>,
                sortBy: (row) => row.keyword,
              },
              {
                key: "url",
                header: "Target URL",
                cell: (row) => <code className="text-xs">{row.target_url}</code>,
                sortBy: (row) => row.target_url,
              },
              {
                key: "active",
                header: "Status",
                cell: (row) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.is_active ? "Active" : "Disabled"}
                  </span>
                ),
              },
            ]}
            actions={(row) => (
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setEditingAnchor(row)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onDeleteAnchor(row.id!)}>
                  Delete
                </Button>
              </div>
            )}
          />
        </div>
      )}

      {/* External Resources Tab */}
      {activeTab === "external" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">External Resource Directory</h2>
            <Button
              onClick={() =>
                setEditingResource({
                  title: "",
                  url: "https://",
                  category: "Education",
                  is_dofollow: false,
                  open_in_new_tab: true,
                  is_sponsored: false,
                  is_ugc: false,
                  is_active: true,
                  priority: 0,
                  tags: [],
                })
              }
            >
              Add Trusted Resource
            </Button>
          </div>

          <DataTable<ExtRes & { id: string }>
            rows={(extResources ?? []) as any}
            search
            searchFields={["title", "url", "category"]}
            columns={[
              {
                key: "title",
                header: "Title",
                cell: (row) => (
                  <div>
                    <span className="font-semibold block">{row.title}</span>
                    <span className="text-xs text-muted-foreground">{row.description}</span>
                  </div>
                ),
                sortBy: (row) => row.title,
              },
              {
                key: "url",
                header: "URL & Attributes",
                cell: (row) => (
                  <div className="space-y-1">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {row.url} <ExternalLink className="h-3 w-3" />
                    </a>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[10px] px-1 bg-surface-elevated rounded border border-border">
                        {row.is_dofollow ? "DoFollow" : "NoFollow"}
                      </span>
                      {row.is_sponsored && <span className="text-[10px] px-1 bg-warning/15 text-warning rounded border border-warning/35">Sponsored</span>}
                      {row.is_ugc && <span className="text-[10px] px-1 bg-info/15 text-info rounded border border-info/35">UGC</span>}
                    </div>
                  </div>
                ),
              },
              {
                key: "category",
                header: "Category",
                cell: (row) => <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded">{row.category}</span>,
                sortBy: (row) => row.category,
              },
              {
                key: "priority",
                header: "Priority",
                cell: (row) => <span className="font-mono">{row.priority}</span>,
                sortBy: (row) => row.priority,
              },
            ]}
            actions={(row) => (
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setEditingResource(row)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onDeleteResource(row.id!)}>
                  Delete
                </Button>
              </div>
            )}
          />
        </div>
      )}

      {/* Broken Links Tab */}
      {activeTab === "broken" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Broken Links Log</h2>
              <p className="text-xs text-muted-foreground">Scans site content, external resources, and anchor suggestions to catch 404/network errors.</p>
            </div>
            <Button onClick={handleRunLinkCheck} disabled={checking} className="bg-gradient-primary">
              <Play className="h-4 w-4 mr-2" /> {checking ? "Scanning..." : "Run Link Scan"}
            </Button>
          </div>

          <DataTable<any>
            rows={(brokenLinks ?? []) as any}
            search
            searchFields={["source_url", "target_url"]}
            columns={[
              {
                key: "source",
                header: "Found on Page",
                cell: (row) => <code className="text-xs">{row.source_url}</code>,
                sortBy: (row) => row.source_url,
              },
              {
                key: "target",
                header: "Broken Link URL",
                cell: (row) => (
                  <a
                    href={row.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-destructive hover:underline flex items-center gap-1"
                  >
                    {row.target_url} <ExternalLink className="h-3 w-3" />
                  </a>
                ),
              },
              {
                key: "code",
                header: "HTTP Status",
                cell: (row) => (
                  <span className="inline-flex items-center gap-1 font-semibold text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {row.status_code || "Network Failure"}
                  </span>
                ),
                sortBy: (row) => row.status_code ?? 0,
              },
              {
                key: "type",
                header: "Type",
                cell: (row) => <span className="text-xs uppercase font-mono">{row.link_type}</span>,
              },
              {
                key: "status",
                header: "Resolved?",
                cell: (row) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.is_fixed ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {row.is_fixed ? "Fixed" : "Broken"}
                  </span>
                ),
              },
            ]}
            actions={(row) =>
              !row.is_fixed && (
                <Button size="sm" variant="outline" className="text-success hover:bg-success/15" onClick={() => handleMarkFixed(row.id)}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Fixed
                </Button>
              )
            }
          />
        </div>
      )}

      {/* 404 Monitor Tab */}
      {activeTab === "404" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">404 Error Monitor</h2>
              <p className="text-xs text-muted-foreground">Log of broken page hits requested by users or search crawlers.</p>
            </div>
            {((log404s as any) ?? []).length > 0 && (
              <Button variant="outline" className="text-destructive border-destructive/40" onClick={handleClearLogs}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear 404 Logs
              </Button>
            )}
          </div>

          <DataTable<any>
            rows={(log404s ?? []) as any}
            search
            searchFields={["path", "referrer"]}
            columns={[
              {
                key: "path",
                header: "Requested Path",
                cell: (row) => <code className="text-xs font-bold text-destructive">{row.path}</code>,
                sortBy: (row) => row.path,
              },
              {
                key: "referrer",
                header: "Referrer",
                cell: (row) => (row.referrer ? <span className="text-xs text-muted-foreground">{row.referrer}</span> : <span className="text-xs text-muted-foreground italic">Direct / Search</span>),
              },
              {
                key: "agent",
                header: "Browser / User-Agent",
                cell: (row) => <span className="text-xs text-muted-foreground block max-w-xs truncate">{row.user_agent}</span>,
              },
              {
                key: "time",
                header: "Timestamp",
                cell: (row) => <span className="text-xs font-mono">{new Date(row.created_at).toLocaleString()}</span>,
                sortBy: (row) => row.created_at,
              },
            ]}
          />
        </div>
      )}

      {/* Link Clicks Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Link Clicks & CTR Analytics</h2>
              <p className="text-xs text-muted-foreground">Monitors clicks on internal dynamic suggestions and verified external resources.</p>
            </div>
            <Button variant="outline" onClick={() => refetchAnalytics()}>
              <RotateCcw className="h-4 w-4 mr-2" /> Refresh Metrics
            </Button>
          </div>

          <DataTable<any>
            rows={(linkAnalytics ?? []) as any}
            search
            searchFields={["source_path", "target_url", "anchor_text"]}
            columns={[
              {
                key: "source",
                header: "Source Page",
                cell: (row) => <code className="text-xs">{row.source_path}</code>,
                sortBy: (row) => row.source_path,
              },
              {
                key: "target",
                header: "Target URL",
                cell: (row) => <code className="text-xs text-primary">{row.target_url}</code>,
                sortBy: (row) => row.target_url,
              },
              {
                key: "anchor",
                header: "Anchor Text",
                cell: (row) => <span className="italic font-medium">"{row.anchor_text}"</span>,
              },
              {
                key: "type",
                header: "Link Type",
                cell: (row) => <span className="text-xs capitalize">{row.link_type}</span>,
              },
              {
                key: "clicks",
                header: "Clicks Logged",
                cell: (row) => <span className="font-mono font-bold text-base">{row.clicks_count}</span>,
                sortBy: (row) => row.clicks_count,
              },
            ]}
          />
        </div>
      )}

      {/* Editing Resource Dialog */}
      <Dialog open={!!editingResource} onOpenChange={(o) => !o && setEditingResource(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingResource?.id ? "Edit Trusted Resource" : "Add Trusted Resource"}</DialogTitle>
          </DialogHeader>
          {editingResource && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Title *</label>
                  <Input
                    placeholder="W3C Official Site"
                    value={editingResource.title}
                    onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">URL *</label>
                  <Input
                    placeholder="https://www.w3.org"
                    value={editingResource.url}
                    onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Description</label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Official standards body for HTML, CSS and web standards."
                  value={editingResource.description || ""}
                  onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Logo URL</label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={editingResource.logo_url || ""}
                    onChange={(e) => setEditingResource({ ...editingResource, logo_url: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Category *</label>
                  <select
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
                    value={editingResource.category}
                    onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value })}
                  >
                    {TRUSTED_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Country Code</label>
                  <Input
                    placeholder="US"
                    maxLength={5}
                    value={editingResource.country || ""}
                    onChange={(e) => setEditingResource({ ...editingResource, country: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Language</label>
                  <Input
                    placeholder="en"
                    maxLength={10}
                    value={editingResource.language || ""}
                    onChange={(e) => setEditingResource({ ...editingResource, language: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Priority Order</label>
                  <Input
                    type="number"
                    value={editingResource.priority}
                    onChange={(e) => setEditingResource({ ...editingResource, priority: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Attributes Checklist */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-surface-elevated/40 rounded-lg border border-border/40">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingResource.is_dofollow}
                    onChange={(e) => setEditingResource({ ...editingResource, is_dofollow: e.target.checked })}
                  />
                  <span>DoFollow Link (rel="dofollow")</span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingResource.open_in_new_tab}
                    onChange={(e) => setEditingResource({ ...editingResource, open_in_new_tab: e.target.checked })}
                  />
                  <span>Open In New Tab (target="_blank")</span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingResource.is_sponsored}
                    onChange={(e) => setEditingResource({ ...editingResource, is_sponsored: e.target.checked })}
                  />
                  <span>Sponsored Link (rel="sponsored")</span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingResource.is_ugc}
                    onChange={(e) => setEditingResource({ ...editingResource, is_ugc: e.target.checked })}
                  />
                  <span>User Generated Content (rel="ugc")</span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer select-none col-span-2 border-t border-border/30 pt-2 mt-1">
                  <input
                    type="checkbox"
                    checked={editingResource.is_active}
                    onChange={(e) => setEditingResource({ ...editingResource, is_active: e.target.checked })}
                  />
                  <span className="font-semibold text-primary">Active Directory listing</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" onClick={() => setEditingResource(null)}>
                  Cancel
                </Button>
                <Button onClick={() => onSaveResource(editingResource)}>Save Resource</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editing Anchor Suggester Dialog */}
      <Dialog open={!!editingAnchor} onOpenChange={(o) => !o && setEditingAnchor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnchor?.id ? "Edit Keyword Mapping" : "New Keyword Mapping"}</DialogTitle>
          </DialogHeader>
          {editingAnchor && (
            <div className="grid gap-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Keyword / Phrase *</label>
                <Input
                  placeholder="typing speed test"
                  value={editingAnchor.keyword}
                  onChange={(e) => setEditingAnchor({ ...editingAnchor, keyword: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Target URL *</label>
                <Input
                  placeholder="/typing-test"
                  value={editingAnchor.target_url}
                  onChange={(e) => setEditingAnchor({ ...editingAnchor, target_url: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer select-none mt-2">
                <input
                  type="checkbox"
                  checked={editingAnchor.is_active}
                  onChange={(e) => setEditingAnchor({ ...editingAnchor, is_active: e.target.checked })}
                />
                <span className="font-semibold">Enable Active Contextual Injection</span>
              </label>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" onClick={() => setEditingAnchor(null)}>
                  Cancel
                </Button>
                <Button onClick={() => onSaveAnchor(editingAnchor)}>Save Suggestion</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
