import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAds, upsertAd, deleteAd } from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";

export const Route = createFileRoute("/_authenticated/admin/ads")({ component: AdsPage });

type Ad = {
  id?: string;
  name: string;
  slot_key: string;
  kind: "adsense" | "custom";
  adsense_client?: string | null;
  adsense_slot?: string | null;
  custom_html?: string | null;
  page_match?: string | null;
  is_active: boolean;
};

function AdsPage() {
  const list = useServerFn(listAds);
  const save = useServerFn(upsertAd);
  const del = useServerFn(deleteAd);
  const { data, refetch } = useQuery({ queryKey: ["admin-ads"], queryFn: () => list() });
  const [editing, setEditing] = useState<Ad | null>(null);

  async function onSave(a: Ad) {
    try {
      await save({ data: a as any });
      toast.success("Saved");
      setEditing(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete?")) return;
    try {
      await del({ data: { id } });
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ad Placements</h1>
          <p className="text-sm text-muted-foreground">
            Google AdSense slots or custom HTML banners. Use page_match (regex) to scope.
          </p>
        </div>
        <Button
          onClick={() => setEditing({ name: "", slot_key: "", kind: "adsense", is_active: true })}
        >
          New ad
        </Button>
      </header>

      <DataTable<Ad & { id: string }>
        rows={(data ?? []) as any}
        search
        searchFields={["name", "slot_key"]}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (r) => <span className="font-medium">{r.name}</span>,
          },
          {
            key: "slot",
            header: "Slot key",
            cell: (r) => <code className="text-xs">{r.slot_key}</code>,
          },
          { key: "kind", header: "Kind", cell: (r) => r.kind },
          {
            key: "page",
            header: "Page match",
            cell: (r) => <code className="text-xs">{r.page_match || "—"}</code>,
          },
          { key: "active", header: "Active", cell: (r) => (r.is_active ? "Yes" : "No") },
        ]}
        actions={(r) => (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="ml-1" onClick={() => onDelete(r.id!)}>
              Delete
            </Button>
          </>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit ad" : "New ad"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <Input
                placeholder="Name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <Input
                placeholder="slot_key (e.g. header, sidebar)"
                value={editing.slot_key}
                onChange={(e) => setEditing({ ...editing, slot_key: e.target.value })}
              />
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={editing.kind}
                onChange={(e) => setEditing({ ...editing, kind: e.target.value as any })}
              >
                <option value="adsense">Google AdSense</option>
                <option value="custom">Custom HTML</option>
              </select>
              {editing.kind === "adsense" ? (
                <>
                  <Input
                    placeholder="data-ad-client (ca-pub-…)"
                    value={editing.adsense_client ?? ""}
                    onChange={(e) => setEditing({ ...editing, adsense_client: e.target.value })}
                  />
                  <Input
                    placeholder="data-ad-slot"
                    value={editing.adsense_slot ?? ""}
                    onChange={(e) => setEditing({ ...editing, adsense_slot: e.target.value })}
                  />
                </>
              ) : (
                <Textarea
                  className="min-h-32 font-mono text-xs"
                  placeholder="<div>…</div>"
                  value={editing.custom_html ?? ""}
                  onChange={(e) => setEditing({ ...editing, custom_html: e.target.value })}
                />
              )}
              <Input
                placeholder="Page match (regex, optional)"
                value={editing.page_match ?? ""}
                onChange={(e) => setEditing({ ...editing, page_match: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />{" "}
                Active
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={() => onSave(editing)}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
