import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listRedirects, upsertRedirect, deleteRedirect } from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";

export const Route = createFileRoute("/_authenticated/admin/redirects")({
  component: RedirectsPage,
});

type R = {
  id?: string;
  source: string;
  destination: string;
  status_code: number;
  is_active: boolean;
};

function RedirectsPage() {
  const list = useServerFn(listRedirects);
  const save = useServerFn(upsertRedirect);
  const del = useServerFn(deleteRedirect);
  const { data, refetch } = useQuery({ queryKey: ["admin-redirects"], queryFn: () => list() });
  const [editing, setEditing] = useState<R | null>(null);

  async function onSave(r: R) {
    try {
      await save({ data: r as any });
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
          <h1 className="text-2xl font-semibold tracking-tight">Redirects</h1>
          <p className="text-sm text-muted-foreground">
            Map old URLs to new ones with the right HTTP status.
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({ source: "/", destination: "/", status_code: 301, is_active: true })
          }
        >
          New redirect
        </Button>
      </header>

      <DataTable<R & { id: string }>
        rows={(data ?? []) as any}
        search
        searchFields={["source", "destination"]}
        columns={[
          {
            key: "src",
            header: "Source",
            cell: (r) => <code className="text-xs">{r.source}</code>,
            sortBy: (r) => r.source,
          },
          {
            key: "dst",
            header: "Destination",
            cell: (r) => <code className="text-xs">{r.destination}</code>,
          },
          { key: "code", header: "Code", cell: (r) => r.status_code, sortBy: (r) => r.status_code },
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
            <DialogTitle>{editing?.id ? "Edit redirect" : "New redirect"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <Input
                placeholder="Source (/old-path)"
                value={editing.source}
                onChange={(e) => setEditing({ ...editing, source: e.target.value })}
              />
              <Input
                placeholder="Destination (/new-path or full URL)"
                value={editing.destination}
                onChange={(e) => setEditing({ ...editing, destination: e.target.value })}
              />
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={editing.status_code}
                onChange={(e) => setEditing({ ...editing, status_code: Number(e.target.value) })}
              >
                <option value={301}>301 Moved Permanently</option>
                <option value={302}>302 Found</option>
                <option value={307}>307 Temporary</option>
                <option value={308}>308 Permanent</option>
              </select>
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
