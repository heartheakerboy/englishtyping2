import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listAnnouncements,
  upsertAnnouncement,
  deleteAnnouncement,
} from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";

export const Route = createFileRoute("/_authenticated/admin/announcements")({ component: AnnPage });

type A = {
  id?: string;
  message: string;
  href?: string | null;
  variant: "info" | "success" | "warning" | "promo";
  dismissible: boolean;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

function AnnPage() {
  const list = useServerFn(listAnnouncements);
  const save = useServerFn(upsertAnnouncement);
  const del = useServerFn(deleteAnnouncement);
  const { data, refetch } = useQuery({ queryKey: ["admin-ann"], queryFn: () => list() });
  const [editing, setEditing] = useState<A | null>(null);
  async function onSave(a: A) {
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
          <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground">Top-of-site banner shown to all visitors.</p>
        </div>
        <Button
          onClick={() =>
            setEditing({ message: "", variant: "info", dismissible: true, is_active: true })
          }
        >
          New announcement
        </Button>
      </header>

      <DataTable<A & { id: string }>
        rows={(data ?? []) as any}
        search
        searchFields={["message"]}
        columns={[
          {
            key: "msg",
            header: "Message",
            cell: (r) => <span className="font-medium">{r.message}</span>,
          },
          { key: "v", header: "Variant", cell: (r) => r.variant },
          {
            key: "link",
            header: "Link",
            cell: (r) =>
              r.href ? (
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  open
                </a>
              ) : (
                "—"
              ),
          },
          {
            key: "win",
            header: "Window",
            cell: (r) =>
              `${r.starts_at ? new Date(r.starts_at).toLocaleDateString() : "—"} → ${r.ends_at ? new Date(r.ends_at).toLocaleDateString() : "—"}`,
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "New"} announcement</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <Input
                placeholder="Message"
                value={editing.message}
                onChange={(e) => setEditing({ ...editing, message: e.target.value })}
              />
              <Input
                placeholder="Link URL (optional)"
                value={editing.href ?? ""}
                onChange={(e) => setEditing({ ...editing, href: e.target.value || null })}
              />
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={editing.variant}
                onChange={(e) => setEditing({ ...editing, variant: e.target.value as any })}
              >
                <option value="info">info</option>
                <option value="success">success</option>
                <option value="warning">warning</option>
                <option value="promo">promo</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="datetime-local"
                  placeholder="Starts at"
                  value={editing.starts_at?.slice(0, 16) ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      starts_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                />
                <Input
                  type="datetime-local"
                  placeholder="Ends at"
                  value={editing.ends_at?.slice(0, 16) ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.dismissible}
                    onChange={(e) => setEditing({ ...editing, dismissible: e.target.checked })}
                  />{" "}
                  Dismissible
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  />{" "}
                  Active
                </label>
              </div>
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
