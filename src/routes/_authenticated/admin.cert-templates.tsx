import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listCertTemplates,
  upsertCertTemplate,
  deleteCertTemplate,
} from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";

export const Route = createFileRoute("/_authenticated/admin/cert-templates")({
  component: CertTemplatesPage,
});

type T = {
  id?: string;
  name: string;
  description?: string | null;
  template: any;
  preview_url?: string | null;
  is_active: boolean;
  is_default: boolean;
};

function CertTemplatesPage() {
  const list = useServerFn(listCertTemplates);
  const save = useServerFn(upsertCertTemplate);
  const del = useServerFn(deleteCertTemplate);
  const { data, refetch } = useQuery({ queryKey: ["cert-tpls"], queryFn: () => list() });
  const [editing, setEditing] = useState<T | null>(null);
  async function onSave(t: T) {
    try {
      const tpl =
        typeof t.template === "string" ? JSON.parse(t.template || "{}") : (t.template ?? {});
      await save({ data: { ...t, template: tpl } as any });
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
          <h1 className="text-2xl font-semibold tracking-tight">Certificate Templates</h1>
          <p className="text-sm text-muted-foreground">
            Design and manage downloadable certificate layouts.
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              name: "",
              template: { layout: "classic", color: "#22d3ee" },
              is_active: true,
              is_default: false,
            })
          }
        >
          New template
        </Button>
      </header>

      <DataTable<T & { id: string }>
        rows={(data ?? []) as any}
        search
        searchFields={["name"]}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (r) => (
              <span className="font-medium">
                {r.name}
                {r.is_default ? (
                  <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
                    Default
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            key: "desc",
            header: "Description",
            cell: (r) => (
              <span className="text-xs text-muted-foreground">{r.description ?? "—"}</span>
            ),
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
            <DialogTitle>{editing?.id ? "Edit template" : "New template"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <Input
                placeholder="Name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
              <Input
                placeholder="Preview URL"
                value={editing.preview_url ?? ""}
                onChange={(e) => setEditing({ ...editing, preview_url: e.target.value || null })}
              />
              <Textarea
                className="min-h-40 font-mono text-xs"
                placeholder="Template JSON"
                value={
                  typeof editing.template === "string"
                    ? editing.template
                    : JSON.stringify(editing.template ?? {}, null, 2)
                }
                onChange={(e) => setEditing({ ...editing, template: e.target.value as any })}
              />
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  />{" "}
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.is_default}
                    onChange={(e) => setEditing({ ...editing, is_default: e.target.checked })}
                  />{" "}
                  Default
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
