import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableList } from "@/components/admin/SortableList";
import {
  listDurationsAdmin,
  upsertDuration,
  deleteDuration,
  reorderDurations,
  type TestDuration,
  type FaqItem,
} from "@/lib/test-durations.functions";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/durations")({ component: Page });

type Editable = Partial<TestDuration> & { faq: FaqItem[] };

function emptyRow(): Editable {
  return {
    slug: "",
    seconds: 60,
    kind: "time",
    h1: "",
    nav_label: "",
    title: "",
    meta_description: "",
    description_md: "",
    banner_url: "",
    category: "general",
    difficulty: "medium",
    faq: [],
    featured: false,
    popular: false,
    is_new: false,
    enabled: true,
    sort_order: 0,
  };
}

function Page() {
  const list = useServerFn(listDurationsAdmin);
  const save = useServerFn(upsertDuration);
  const del = useServerFn(deleteDuration);
  const reorder = useServerFn(reorderDurations);
  const { data, refetch } = useQuery({ queryKey: ["admin-durations"], queryFn: () => list() });
  const [editing, setEditing] = useState<Editable | null>(null);

  const rows = (data ?? []) as TestDuration[];

  async function onSave() {
    if (!editing) return;
    try {
      await save({
        data: {
          ...editing,
          banner_url: editing.banner_url || null,
          seconds: editing.kind === "custom" ? null : Number(editing.seconds),
          faq: editing.faq ?? [],
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
    if (!confirm("Delete this duration?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onReorder(ids: string[]) {
    try {
      await reorder({ data: { ids } });
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Test Durations</h1>
          <p className="text-sm text-muted-foreground">
            Manage all <code className="text-xs">/typing-test/[slug]</code> pages. Drag to reorder.
          </p>
        </div>
        <Button onClick={() => setEditing(emptyRow())}>
          <Plus className="mr-1 h-4 w-4" /> New duration
        </Button>
      </header>

      <SortableList
        items={rows}
        onReorder={onReorder}
        renderItem={(d) => (
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{d.nav_label}</span>
                {d.featured && (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] uppercase text-amber-500">
                    Featured
                  </span>
                )}
                {d.popular && (
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] uppercase text-emerald-500">
                    Popular
                  </span>
                )}
                {d.is_new && (
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] uppercase text-primary">
                    New
                  </span>
                )}
                {!d.enabled && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                    Disabled
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                /typing-test/{d.slug} · {d.seconds ? `${d.seconds}s` : "Custom"} · {d.difficulty}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing({ ...d, faq: d.faq ?? [] })}
            >
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(d.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit duration" : "New duration"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-xs">
                Slug (URL)
                <Input
                  value={editing.slug ?? ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="30-seconds"
                />
              </label>
              <label className="text-xs">
                Nav label
                <Input
                  value={editing.nav_label ?? ""}
                  onChange={(e) => setEditing({ ...editing, nav_label: e.target.value })}
                  placeholder="30 Second Typing Test"
                />
              </label>
              <label className="text-xs">
                Kind
                <select
                  className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  value={editing.kind ?? "time"}
                  onChange={(e) => setEditing({ ...editing, kind: e.target.value as any })}
                >
                  <option value="time">time</option>
                  <option value="custom">custom</option>
                </select>
              </label>
              <label className="text-xs">
                Default timer (seconds)
                <Input
                  type="number"
                  disabled={editing.kind === "custom"}
                  value={editing.seconds ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      seconds: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </label>
              <label className="text-xs md:col-span-2">
                H1
                <Input
                  value={editing.h1 ?? ""}
                  onChange={(e) => setEditing({ ...editing, h1: e.target.value })}
                />
              </label>
              <label className="text-xs md:col-span-2">
                Page title
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </label>
              <label className="text-xs md:col-span-2">
                Meta description
                <Textarea
                  rows={2}
                  value={editing.meta_description ?? ""}
                  onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
                />
              </label>
              <label className="text-xs md:col-span-2">
                Banner image URL
                <Input
                  value={editing.banner_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, banner_url: e.target.value })}
                  placeholder="https://…"
                />
              </label>
              <label className="text-xs">
                Category
                <Input
                  value={editing.category ?? ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </label>
              <label className="text-xs">
                Difficulty
                <select
                  className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  value={editing.difficulty ?? "medium"}
                  onChange={(e) => setEditing({ ...editing, difficulty: e.target.value })}
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </label>
              <label className="text-xs md:col-span-2">
                Description (markdown)
                <Textarea
                  rows={4}
                  value={editing.description_md ?? ""}
                  onChange={(e) => setEditing({ ...editing, description_md: e.target.value })}
                />
              </label>

              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-medium">FAQ</div>
                <div className="space-y-2">
                  {(editing.faq ?? []).map((f, i) => (
                    <Card key={i} className="p-2">
                      <Input
                        className="mb-1"
                        placeholder="Question"
                        value={f.q}
                        onChange={(e) => {
                          const next = [...(editing.faq ?? [])];
                          next[i] = { ...f, q: e.target.value };
                          setEditing({ ...editing, faq: next });
                        }}
                      />
                      <Textarea
                        rows={2}
                        placeholder="Answer"
                        value={f.a}
                        onChange={(e) => {
                          const next = [...(editing.faq ?? [])];
                          next[i] = { ...f, a: e.target.value };
                          setEditing({ ...editing, faq: next });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-1"
                        onClick={() => {
                          const next = (editing.faq ?? []).filter((_, j) => j !== i);
                          setEditing({ ...editing, faq: next });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </Card>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditing({ ...editing, faq: [...(editing.faq ?? []), { q: "", a: "" }] })
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add FAQ
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!editing.enabled}
                    onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  />{" "}
                  Enabled
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!editing.featured}
                    onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  />{" "}
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!editing.popular}
                    onChange={(e) => setEditing({ ...editing, popular: e.target.checked })}
                  />{" "}
                  Popular
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!editing.is_new}
                    onChange={(e) => setEditing({ ...editing, is_new: e.target.checked })}
                  />{" "}
                  New
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={onSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
