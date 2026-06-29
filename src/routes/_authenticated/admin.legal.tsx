import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listLegalPagesAdmin,
  upsertLegalPage,
  deleteLegalPage,
  listLegalVersions,
  restoreLegalVersion,
} from "@/lib/footer.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";
import { History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/legal")({ component: LegalAdmin });

type Page = {
  id?: string;
  slug: string;
  title: string;
  content: string;
  format: "markdown" | "html";
  status: "draft" | "published" | "scheduled";
  publish_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  schema_jsonld?: any;
  canonical_url?: string | null;
  robots?: string | null;
  breadcrumbs?: any;
  show_in_footer: boolean;
  show_in_nav: boolean;
  attachments?: any;
  sort_order: number;
};

const empty: Page = {
  slug: "",
  title: "",
  content: "",
  format: "markdown",
  status: "draft",
  show_in_footer: true,
  show_in_nav: false,
  sort_order: 0,
  robots: "index,follow",
};

function LegalAdmin() {
  const list = useServerFn(listLegalPagesAdmin);
  const save = useServerFn(upsertLegalPage);
  const del = useServerFn(deleteLegalPage);
  const listVersions = useServerFn(listLegalVersions);
  const restore = useServerFn(restoreLegalVersion);

  const { data, refetch } = useQuery({ queryKey: ["admin-legal"], queryFn: () => list() });
  const [editing, setEditing] = useState<Page | null>(null);
  const [versions, setVersions] = useState<any[] | null>(null);

  // Autosave draft
  useEffect(() => {
    if (!editing) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(`legal-draft-${editing.id ?? "new"}`, JSON.stringify(editing));
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [editing]);

  async function onSave() {
    if (!editing) return;
    try {
      const res = await save({ data: editing as any });
      toast.success("Saved");
      try {
        localStorage.removeItem(`legal-draft-${editing.id ?? "new"}`);
      } catch {}
      setEditing(null);
      refetch();
      return res;
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this legal page?")) return;
    await del({ data: { id } });
    refetch();
  }
  async function openVersions(pageId: string) {
    const v = await listVersions({ data: { pageId } });
    setVersions(v);
  }
  async function onRestore(versionId: string) {
    await restore({ data: { versionId } });
    toast.success("Restored");
    setVersions(null);
    refetch();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Legal Pages</h1>
          <p className="text-sm text-muted-foreground">
            Privacy, Terms, Disclaimer and any custom legal page. Renders at{" "}
            <code>/legal/&lt;slug&gt;</code>.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}>New page</Button>
      </header>

      <DataTable<Page & { id: string }>
        rows={(data ?? []) as any}
        search
        searchFields={["title", "slug"]}
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (r) => <span className="font-medium">{r.title}</span>,
          },
          {
            key: "slug",
            header: "Slug",
            cell: (r) => <code className="text-xs">/legal/{r.slug}</code>,
          },
          { key: "status", header: "Status", cell: (r) => r.status },
          { key: "footer", header: "In footer", cell: (r) => (r.show_in_footer ? "Yes" : "No") },
        ]}
        actions={(r) => (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="ml-1" onClick={() => openVersions(r.id!)}>
              <History className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="ml-1" onClick={() => onDelete(r.id!)}>
              Delete
            </Button>
          </>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit legal page" : "New legal page"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Title"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
                <Input
                  placeholder="slug (e.g. privacy-policy)"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase() })}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  value={editing.format}
                  onChange={(e) => setEditing({ ...editing, format: e.target.value as any })}
                >
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
                <select
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
                <Input
                  type="datetime-local"
                  placeholder="Publish at"
                  value={editing.publish_at?.slice(0, 16) ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      publish_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                />
              </div>
              <Textarea
                className="min-h-64 font-mono text-xs"
                placeholder="Content (Markdown or HTML)"
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              />

              <details className="rounded-md border border-border p-3">
                <summary className="cursor-pointer text-sm font-medium">SEO</summary>
                <div className="mt-3 grid gap-3">
                  <Input
                    placeholder="Meta title"
                    value={editing.meta_title ?? ""}
                    onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Meta description"
                    value={editing.meta_description ?? ""}
                    onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
                  />
                  <Input
                    placeholder="OG image URL"
                    value={editing.og_image ?? ""}
                    onChange={(e) => setEditing({ ...editing, og_image: e.target.value })}
                  />
                  <Input
                    placeholder="Canonical URL"
                    value={editing.canonical_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, canonical_url: e.target.value })}
                  />
                  <Input
                    placeholder="Robots (e.g. index,follow)"
                    value={editing.robots ?? ""}
                    onChange={(e) => setEditing({ ...editing, robots: e.target.value })}
                  />
                  <Textarea
                    className="font-mono text-xs"
                    placeholder="JSON-LD schema (JSON)"
                    value={
                      editing.schema_jsonld ? JSON.stringify(editing.schema_jsonld, null, 2) : ""
                    }
                    onChange={(e) => {
                      try {
                        setEditing({
                          ...editing,
                          schema_jsonld: e.target.value ? JSON.parse(e.target.value) : null,
                        });
                      } catch {
                        /* ignore until valid */
                      }
                    }}
                  />
                  <Textarea
                    className="font-mono text-xs"
                    placeholder='Breadcrumbs (JSON array, e.g. [{"@type":"ListItem","position":1,"name":"Home","item":"/"}])'
                    value={editing.breadcrumbs ? JSON.stringify(editing.breadcrumbs, null, 2) : ""}
                    onChange={(e) => {
                      try {
                        setEditing({
                          ...editing,
                          breadcrumbs: e.target.value ? JSON.parse(e.target.value) : null,
                        });
                      } catch {}
                    }}
                  />
                </div>
              </details>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.show_in_footer}
                    onChange={(e) => setEditing({ ...editing, show_in_footer: e.target.checked })}
                  />{" "}
                  Show in footer
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.show_in_nav}
                    onChange={(e) => setEditing({ ...editing, show_in_nav: e.target.checked })}
                  />{" "}
                  Show in nav
                </label>
                <Input
                  className="w-32"
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) =>
                    setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Order"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing({ ...editing, status: "draft" })}
                >
                  Mark draft
                </Button>
                <Button onClick={onSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!versions} onOpenChange={(o) => !o && setVersions(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {versions?.length ? (
              versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-border p-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{v.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(v.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onRestore(v.id)}>
                    Restore
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No previous versions.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
