import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listGamesAdmin,
  upsertGame,
  deleteGame,
  reorderGames,
} from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SortableList } from "@/components/admin/SortableList";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/games")({ component: GamesPage });

type Game = {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  difficulty: "easy" | "medium" | "hard";
  timer_seconds?: number | null;
  xp_reward: number;
  coin_reward: number;
  icon_url?: string | null;
  banner_url?: string | null;
  audio_url?: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  levels?: any;
  rules?: any;
  scoring?: any;
};

function GamesPage() {
  const list = useServerFn(listGamesAdmin);
  const save = useServerFn(upsertGame);
  const del = useServerFn(deleteGame);
  const reorder = useServerFn(reorderGames);
  const { data, refetch } = useQuery({ queryKey: ["admin-games"], queryFn: () => list() });
  const [editing, setEditing] = useState<Game | null>(null);

  async function onSave(g: Game) {
    try {
      await save({
        data: {
          ...g,
          levels: typeof g.levels === "string" ? JSON.parse(g.levels || "{}") : (g.levels ?? {}),
          rules: typeof g.rules === "string" ? JSON.parse(g.rules || "{}") : (g.rules ?? {}),
          scoring:
            typeof g.scoring === "string" ? JSON.parse(g.scoring || "{}") : (g.scoring ?? {}),
        } as any,
      });
      toast.success("Saved");
      setEditing(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this game?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Games</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Configure rules, scoring, levels and rewards as JSON.
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              slug: "",
              title: "",
              difficulty: "medium",
              xp_reward: 50,
              coin_reward: 10,
              is_active: true,
              is_featured: false,
              sort_order: 0,
              levels: {},
              rules: {},
              scoring: {},
            })
          }
        >
          New game
        </Button>
      </header>

      <Card className="p-3">
        <SortableList
          items={(data ?? []) as any}
          onReorder={async (ids) => {
            try {
              await reorder({ data: { ids } });
              refetch();
            } catch (e: any) {
              toast.error(e.message);
            }
          }}
          renderItem={(g: any) => (
            <div className="flex items-center gap-3">
              {g.icon_url ? (
                <img src={g.icon_url} alt="" className="h-8 w-8 rounded-md object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-md bg-surface-elevated" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">
                  {g.title} <span className="ml-2 text-xs text-muted-foreground">/{g.slug}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {g.difficulty} · {g.timer_seconds ?? 0}s · {g.xp_reward} XP{" "}
                  {g.is_featured ? "· Featured" : ""}
                  {g.is_active ? "" : " · disabled"}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing({ ...g })}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(g.id)}>
                Delete
              </Button>
            </div>
          )}
        />
        {!data?.length && <div className="p-4 text-sm text-muted-foreground">No games yet.</div>}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit game" : "New game"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                placeholder="Title"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
              <Input
                placeholder="slug (lowercase-dashes)"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              />
              <Textarea
                className="md:col-span-2"
                placeholder="Description"
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={editing.difficulty}
                onChange={(e) => setEditing({ ...editing, difficulty: e.target.value as any })}
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
              <Input
                placeholder="Timer seconds"
                type="number"
                value={editing.timer_seconds ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, timer_seconds: Number(e.target.value) || null })
                }
              />
              <Input
                placeholder="XP reward"
                type="number"
                value={editing.xp_reward}
                onChange={(e) => setEditing({ ...editing, xp_reward: Number(e.target.value) })}
              />
              <Input
                placeholder="Coin reward"
                type="number"
                value={editing.coin_reward}
                onChange={(e) => setEditing({ ...editing, coin_reward: Number(e.target.value) })}
              />
              <Input
                placeholder="Icon URL"
                value={editing.icon_url ?? ""}
                onChange={(e) => setEditing({ ...editing, icon_url: e.target.value || null })}
              />
              <Input
                placeholder="Banner URL"
                value={editing.banner_url ?? ""}
                onChange={(e) => setEditing({ ...editing, banner_url: e.target.value || null })}
              />
              <Input
                placeholder="Audio URL"
                value={editing.audio_url ?? ""}
                onChange={(e) => setEditing({ ...editing, audio_url: e.target.value || null })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />{" "}
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_featured}
                  onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
                />{" "}
                Featured
              </label>
              <Textarea
                className="md:col-span-2 font-mono text-xs"
                placeholder='Levels JSON e.g. {"levels":[{"id":1,"goal":40}]}'
                value={
                  typeof editing.levels === "string"
                    ? editing.levels
                    : JSON.stringify(editing.levels ?? {}, null, 2)
                }
                onChange={(e) => setEditing({ ...editing, levels: e.target.value as any })}
              />
              <Textarea
                className="md:col-span-2 font-mono text-xs"
                placeholder="Rules JSON"
                value={
                  typeof editing.rules === "string"
                    ? editing.rules
                    : JSON.stringify(editing.rules ?? {}, null, 2)
                }
                onChange={(e) => setEditing({ ...editing, rules: e.target.value as any })}
              />
              <Textarea
                className="md:col-span-2 font-mono text-xs"
                placeholder="Scoring JSON"
                value={
                  typeof editing.scoring === "string"
                    ? editing.scoring
                    : JSON.stringify(editing.scoring ?? {}, null, 2)
                }
                onChange={(e) => setEditing({ ...editing, scoring: e.target.value as any })}
              />
              <div className="md:col-span-2 flex justify-end gap-2">
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
