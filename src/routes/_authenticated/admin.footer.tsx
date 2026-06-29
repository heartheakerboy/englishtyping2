import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  listFooterSectionsAdmin,
  upsertFooterSection,
  deleteFooterSection,
  reorderFooterSections,
  listFooterLinksAdmin,
  upsertFooterLink,
  deleteFooterLink,
  reorderFooterLinks,
} from "@/lib/footer.functions";
import { updateSetting, getPublicSettings } from "@/lib/cms.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { SortableList } from "@/components/admin/SortableList";
import { Trash2, Plus, Eye } from "lucide-react";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/_authenticated/admin/footer")({ component: FooterAdmin });

function FooterAdmin() {
  const listSections = useServerFn(listFooterSectionsAdmin);
  const saveSection = useServerFn(upsertFooterSection);
  const delSection = useServerFn(deleteFooterSection);
  const reorderSections = useServerFn(reorderFooterSections);
  const listLinks = useServerFn(listFooterLinksAdmin);
  const saveLink = useServerFn(upsertFooterLink);
  const delLink = useServerFn(deleteFooterLink);
  const reorderLinks = useServerFn(reorderFooterLinks);
  const getSettings = useServerFn(getPublicSettings);
  const saveSetting = useServerFn(updateSetting);

  const sectionsQ = useQuery({
    queryKey: ["admin-footer-sections"],
    queryFn: () => listSections(),
  });
  const linksQ = useQuery({ queryKey: ["admin-footer-links"], queryFn: () => listLinks() });
  const settingsQ = useQuery({ queryKey: ["public-settings"], queryFn: () => getSettings() });

  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [editingLink, setEditingLink] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const brand = settingsQ.data?.footer_brand ?? {
    name: "English Typing Test",
    description: "",
    logo: "",
  };
  const bottom = settingsQ.data?.footer_bottom ?? {
    copyright: "All rights reserved.",
    company: "English Typing Test",
    version: "1.0.0",
    build: "",
  };
  const [brandDraft, setBrandDraft] = useState<any>(null);
  const [bottomDraft, setBottomDraft] = useState<any>(null);
  const b = brandDraft ?? brand;
  const bt = bottomDraft ?? bottom;

  const sections = sectionsQ.data ?? [];
  const links = linksQ.data ?? [];

  async function onSaveBrand() {
    try {
      await saveSetting({ data: { key: "footer_brand", value: b, is_public: true } });
      toast.success("Saved");
      settingsQ.refetch();
      setBrandDraft(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onSaveBottom() {
    try {
      await saveSetting({ data: { key: "footer_bottom", value: bt, is_public: true } });
      toast.success("Saved");
      settingsQ.refetch();
      setBottomDraft(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Footer</h1>
          <p className="text-sm text-muted-foreground">
            Edit logo, sections, links and bottom bar. Changes go live instantly.
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          <Eye className="mr-1 h-4 w-4" /> Preview
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Brand</h2>
          <Input
            placeholder="Website name"
            value={b.name ?? ""}
            onChange={(e) => setBrandDraft({ ...b, name: e.target.value })}
          />
          <Input
            placeholder="Logo URL (optional)"
            value={b.logo ?? ""}
            onChange={(e) => setBrandDraft({ ...b, logo: e.target.value })}
          />
          <Textarea
            placeholder="Short description"
            value={b.description ?? ""}
            onChange={(e) => setBrandDraft({ ...b, description: e.target.value })}
          />
          <Button size="sm" onClick={onSaveBrand} disabled={!brandDraft}>
            Save brand
          </Button>
        </Card>
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Bottom bar</h2>
          <Input
            placeholder="Company name"
            value={bt.company ?? ""}
            onChange={(e) => setBottomDraft({ ...bt, company: e.target.value })}
          />
          <Input
            placeholder="Copyright text (e.g. All rights reserved.)"
            value={bt.copyright ?? ""}
            onChange={(e) => setBottomDraft({ ...bt, copyright: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Version"
              value={bt.version ?? ""}
              onChange={(e) => setBottomDraft({ ...bt, version: e.target.value })}
            />
            <Input
              placeholder="Build"
              value={bt.build ?? ""}
              onChange={(e) => setBottomDraft({ ...bt, build: e.target.value })}
            />
          </div>
          <Button size="sm" onClick={onSaveBottom} disabled={!bottomDraft}>
            Save bottom
          </Button>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Sections</h2>
          <Button
            size="sm"
            onClick={() =>
              setEditingSection({
                key: "",
                title: "",
                sort_order: sections.length,
                is_active: true,
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add section
          </Button>
        </div>
        <SortableList
          items={sections as any[]}
          onReorder={async (ids) => {
            await reorderSections({ data: { ids } });
            sectionsQ.refetch();
          }}
          renderItem={(s: any) => (
            <SectionRow
              section={s}
              links={links.filter((l: any) => l.section_id === s.id)}
              onEditSection={() => setEditingSection(s)}
              onDeleteSection={async () => {
                if (!confirm("Delete section and its links?")) return;
                await delSection({ data: { id: s.id } });
                sectionsQ.refetch();
                linksQ.refetch();
              }}
              onAddLink={() =>
                setEditingLink({
                  section_id: s.id,
                  label: "",
                  href: "",
                  open_in_new_tab: false,
                  sort_order: 0,
                  is_active: true,
                })
              }
              onEditLink={(l: any) => setEditingLink(l)}
              onDeleteLink={async (id: string) => {
                await delLink({ data: { id } });
                linksQ.refetch();
              }}
              onReorderLinks={async (ids: string[]) => {
                await reorderLinks({ data: { ids } });
                linksQ.refetch();
              }}
            />
          )}
        />
      </Card>

      <Dialog open={!!editingSection} onOpenChange={(o) => !o && setEditingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection?.id ? "Edit section" : "New section"}</DialogTitle>
          </DialogHeader>
          {editingSection && (
            <div className="grid gap-3">
              <Input
                placeholder="Key (e.g. resources)"
                value={editingSection.key}
                onChange={(e) => setEditingSection({ ...editingSection, key: e.target.value })}
              />
              <Input
                placeholder="Title"
                value={editingSection.title}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingSection.is_active}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, is_active: e.target.checked })
                  }
                />{" "}
                Active
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await saveSection({ data: editingSection });
                      toast.success("Saved");
                      setEditingSection(null);
                      sectionsQ.refetch();
                    } catch (e: any) {
                      toast.error(e.message);
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingLink} onOpenChange={(o) => !o && setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink?.id ? "Edit link" : "New link"}</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <div className="grid gap-3">
              <Input
                placeholder="Label"
                value={editingLink.label}
                onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
              />
              <Input
                placeholder="href (e.g. /about or https://...)"
                value={editingLink.href}
                onChange={(e) => setEditingLink({ ...editingLink, href: e.target.value })}
              />
              <Input
                placeholder="Icon name (lucide, e.g. facebook)"
                value={editingLink.icon ?? ""}
                onChange={(e) => setEditingLink({ ...editingLink, icon: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingLink.open_in_new_tab}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, open_in_new_tab: e.target.checked })
                  }
                />{" "}
                Open in new tab
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingLink.is_active}
                  onChange={(e) => setEditingLink({ ...editingLink, is_active: e.target.checked })}
                />{" "}
                Active
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditingLink(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await saveLink({ data: editingLink });
                      toast.success("Saved");
                      setEditingLink(null);
                      linksQ.refetch();
                    } catch (e: any) {
                      toast.error(e.message);
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Footer preview</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-border">
            <Footer />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionRow({
  section,
  links,
  onEditSection,
  onDeleteSection,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onReorderLinks,
}: any) {
  const sortedLinks = useMemo(
    () => [...links].sort((a, b) => a.sort_order - b.sort_order),
    [links],
  );
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="text-left" onClick={onEditSection}>
            <div className="text-sm font-medium">{section.title}</div>
            <div className="text-xs text-muted-foreground">
              {section.key} · {section.is_active ? "active" : "hidden"}
            </div>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={onAddLink}>
            <Plus className="h-3.5 w-3.5" /> Link
          </Button>
          <Button size="sm" variant="ghost" onClick={onDeleteSection}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {sortedLinks.length > 0 && (
        <div className="ml-4 border-l border-border pl-3">
          <SortableList
            items={sortedLinks}
            onReorder={onReorderLinks}
            renderItem={(l: any) => (
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => onEditLink(l)} className="min-w-0 flex-1 text-left">
                  <div className="text-sm">{l.label}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {l.href}
                    {l.open_in_new_tab ? " · new tab" : ""}
                    {l.is_active ? "" : " · hidden"}
                  </div>
                </button>
                <Button size="sm" variant="ghost" onClick={() => onDeleteLink(l.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
