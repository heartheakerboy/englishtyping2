import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import { listTypingTextsAdmin, upsertTypingText, deleteTypingText } from "@/lib/cms.functions";
import { duplicateText, scheduleText, bulkImportTexts } from "@/lib/admin-enterprise.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LANGUAGE_LIST } from "@/lib/languages";
import { DataTable } from "@/components/admin/DataTable";
import { Calendar, Copy, Download, Upload, Sparkles } from "lucide-react";

const CATEGORIES = [
  "articles",
  "stories",
  "books",
  "quotes",
  "code",
  "numbers",
  "symbols",
  "government",
  "custom",
];

export const Route = createFileRoute("/_authenticated/admin/texts")({ component: TextsPage });

type Text = {
  id?: string;
  title: string;
  language: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  content: string;
  is_active: boolean;
  status?: string;
  featured?: boolean;
  tags?: string[];
  collection?: string | null;
  publish_at?: string | null;
};

function TextsPage() {
  const list = useServerFn(listTypingTextsAdmin);
  const save = useServerFn(upsertTypingText);
  const del = useServerFn(deleteTypingText);
  const dup = useServerFn(duplicateText);
  const sched = useServerFn(scheduleText);
  const bulk = useServerFn(bulkImportTexts);
  const { data, refetch } = useQuery({ queryKey: ["admin-texts"], queryFn: () => list() });
  const [editing, setEditing] = useState<Text | null>(null);
  const [filterLang, setFilterLang] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    let r = (data ?? []) as Text[];
    if (filterLang !== "all") r = r.filter((t) => t.language === filterLang);
    if (filterStatus !== "all") r = r.filter((t) => (t.status ?? "draft") === filterStatus);
    return r;
  }, [data, filterLang, filterStatus]);

  async function onSave(t: Text) {
    try {
      await save({ data: { ...t, tags: t.tags ?? [] } as any });
      toast.success("Saved");
      setEditing(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this text?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onDuplicate(id: string) {
    try {
      await dup({ data: { id } });
      toast.success("Duplicated");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onSchedule(t: Text) {
    const input = prompt("Publish at (ISO, blank to clear):", t.publish_at ?? "");
    if (input === null) return;
    try {
      await sched({ data: { id: t.id!, publish_at: input || null } });
      toast.success("Scheduled");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  function exportCSV() {
    const csv = Papa.unparse(
      rows.map((r) => ({
        title: r.title,
        language: r.language,
        category: r.category,
        difficulty: r.difficulty,
        content: r.content,
        is_active: r.is_active,
        status: r.status ?? "draft",
        featured: !!r.featured,
        tags: (r.tags ?? []).join(","),
        collection: r.collection ?? "",
      })),
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `typing-texts-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `typing-texts-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function importFile(f: File) {
    try {
      const text = await f.text();
      let parsed: any[] = [];
      if (f.name.endsWith(".json")) parsed = JSON.parse(text);
      else parsed = Papa.parse(text, { header: true, skipEmptyLines: true }).data as any[];
      const result = await bulk({ data: { rows: parsed } });
      toast.success(`Imported ${result.inserted} texts`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Typing Texts</h1>
          <p className="text-sm text-muted-foreground">
            Curated passages used across modes. Draft, schedule, feature and bulk-import.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm"
            aria-label="Filter language"
          >
            <option value="all">All languages</option>
            {LANGUAGE_LIST.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm"
            aria-label="Filter status"
          >
            <option value="all">All status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-1 h-3.5 w-3.5" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportJSON}>
            <Download className="mr-1 h-3.5 w-3.5" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1 h-3.5 w-3.5" />
            Import
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importFile(f);
              e.target.value = "";
            }}
          />
          <Button
            onClick={() =>
              setEditing({
                title: "",
                language: "english",
                category: "articles",
                difficulty: "medium",
                content: "",
                is_active: true,
                status: "draft",
                featured: false,
                tags: [],
              })
            }
          >
            New text
          </Button>
        </div>
      </header>

      <DataTable<Text & { id: string }>
        rows={rows as any}
        search
        searchFields={["title", "category", "language"]}
        initialSort={{ key: "updated", desc: true }}
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (r) => (
              <span className="font-medium">
                {r.title}
                {r.featured ? (
                  <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-400">
                    Featured
                  </span>
                ) : null}
              </span>
            ),
            sortBy: (r) => r.title.toLowerCase(),
          },
          { key: "lang", header: "Lang", cell: (r) => r.language, sortBy: (r) => r.language },
          { key: "cat", header: "Category", cell: (r) => r.category, sortBy: (r) => r.category },
          { key: "diff", header: "Diff", cell: (r) => r.difficulty, sortBy: (r) => r.difficulty },
          {
            key: "status",
            header: "Status",
            cell: (r) => (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${r.status === "published" ? "bg-emerald-500/15 text-emerald-400" : r.status === "scheduled" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"}`}
              >
                {r.status ?? "draft"}
              </span>
            ),
          },
          { key: "active", header: "Active", cell: (r) => (r.is_active ? "Yes" : "No") },
        ]}
        actions={(r) => (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing(r as Text)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-1"
              onClick={() => onDuplicate(r.id!)}
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-1"
              onClick={() => onSchedule(r as Text)}
              title="Schedule"
            >
              <Calendar className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="ml-1" onClick={() => onDelete(r.id!)}>
              Delete
            </Button>
          </>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit text" : "New text"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                placeholder="Title"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={editing.language}
                onChange={(e) => setEditing({ ...editing, language: e.target.value })}
              >
                {LANGUAGE_LIST.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={editing.difficulty}
                onChange={(e) =>
                  setEditing({ ...editing, difficulty: e.target.value as Text["difficulty"] })
                }
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={editing.status ?? "draft"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="scheduled">scheduled</option>
              </select>
              <Input
                placeholder="Collection (optional)"
                value={editing.collection ?? ""}
                onChange={(e) => setEditing({ ...editing, collection: e.target.value || null })}
              />
              <Input
                placeholder="Tags (comma separated)"
                className="md:col-span-2"
                value={(editing.tags ?? []).join(", ")}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    tags: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <Textarea
                className="md:col-span-2 min-h-40 font-mono text-sm"
                placeholder="Content (min 20 chars)…"
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              />
              <div className="md:col-span-2 flex flex-wrap items-center gap-4 text-sm">
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
                    checked={!!editing.featured}
                    onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  />{" "}
                  Featured
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Use the AI Generator on the test page to draft content"
                  className="ml-auto"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  AI draft
                </Button>
              </div>
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
