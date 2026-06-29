import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listBadges, upsertBadge, deleteBadge } from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";

export const Route = createFileRoute("/_authenticated/admin/badges")({ component: BadgesPage });

type B = {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  rarity: "common" | "rare" | "epic" | "legendary";
  color?: string | null;
  icon_url?: string | null;
  xp_reward: number;
  coin_reward: number;
  is_active: boolean;
};

function BadgesPage() {
  const list = useServerFn(listBadges);
  const save = useServerFn(upsertBadge);
  const del = useServerFn(deleteBadge);
  const { data, refetch } = useQuery({ queryKey: ["admin-badges"], queryFn: () => list() });
  const [editing, setEditing] = useState<B | null>(null);
  async function onSave(b: B) {
    try {
      await save({ data: b as any });
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
          <h1 className="text-2xl font-semibold tracking-tight">Badges</h1>
          <p className="text-sm text-muted-foreground">
            Awardable badges with rarity, rewards and custom icons.
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              code: "",
              name: "",
              rarity: "common",
              xp_reward: 50,
              coin_reward: 10,
              is_active: true,
            })
          }
        >
          New badge
        </Button>
      </header>

      <DataTable<B & { id: string }>
        rows={(data ?? []) as any}
        search
        searchFields={["name", "code"]}
        columns={[
          {
            key: "name",
            header: "Badge",
            cell: (r) => (
              <div className="flex items-center gap-2">
                {r.icon_url ? (
                  <img src={r.icon_url} alt="" className="h-6 w-6 rounded" />
                ) : (
                  <div
                    className="h-6 w-6 rounded bg-surface-elevated"
                    style={{ background: r.color ?? undefined }}
                  />
                )}
                <span className="font-medium">{r.name}</span>
              </div>
            ),
          },
          { key: "code", header: "Code", cell: (r) => <code className="text-xs">{r.code}</code> },
          { key: "rar", header: "Rarity", cell: (r) => r.rarity },
          { key: "xp", header: "XP / Coins", cell: (r) => `${r.xp_reward} / ${r.coin_reward}` },
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
            <DialogTitle>{editing?.id ? "Edit badge" : "New badge"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <Input
                placeholder="Name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <Input
                placeholder="code (lowercase-dashes)"
                value={editing.code}
                onChange={(e) => setEditing({ ...editing, code: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  value={editing.rarity}
                  onChange={(e) => setEditing({ ...editing, rarity: e.target.value as any })}
                >
                  <option value="common">common</option>
                  <option value="rare">rare</option>
                  <option value="epic">epic</option>
                  <option value="legendary">legendary</option>
                </select>
                <Input
                  placeholder="Color (e.g. #facc15)"
                  value={editing.color ?? ""}
                  onChange={(e) => setEditing({ ...editing, color: e.target.value || null })}
                />
              </div>
              <Input
                placeholder="Icon URL"
                value={editing.icon_url ?? ""}
                onChange={(e) => setEditing({ ...editing, icon_url: e.target.value || null })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="XP reward"
                  value={editing.xp_reward}
                  onChange={(e) => setEditing({ ...editing, xp_reward: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Coin reward"
                  value={editing.coin_reward}
                  onChange={(e) => setEditing({ ...editing, coin_reward: Number(e.target.value) })}
                />
              </div>
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
