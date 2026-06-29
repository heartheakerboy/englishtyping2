// Admin: full-control list of all custom tests with bulk actions.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminListAllTests, adminBulkAction } from "@/lib/custom-tests.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/custom-tests")({
  component: AdminCustomTests,
});

function AdminCustomTests() {
  const list = useServerFn(adminListAllTests);
  const bulk = useServerFn(adminBulkAction);
  const [tests, setTests] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setTests(await list());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  const filtered = tests.filter(
    (t) =>
      !filter || t.name.toLowerCase().includes(filter.toLowerCase()) || t.slug.includes(filter),
  );

  function toggle(id: string) {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  }

  async function run(action: any) {
    if (selected.size === 0) return toast.error("Select rows first");
    if (action === "delete" && !confirm(`Delete ${selected.size} tests?`)) return;
    await bulk({ data: { ids: Array.from(selected), action } });
    toast.success(`${action} applied`);
    setSelected(new Set());
    load();
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Custom Tests</h1>
          <p className="text-sm text-muted-foreground">Manage all user-created challenges.</p>
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search…"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
      </header>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2 rounded-md border border-primary/40 bg-primary/5 p-2 text-sm">
          <span className="text-muted-foreground">{selected.size} selected:</span>
          {(
            [
              "publish",
              "unpublish",
              "archive",
              "feature",
              "unfeature",
              "pin",
              "unpin",
              "delete",
            ] as const
          ).map((a) => (
            <Button
              key={a}
              size="sm"
              variant={a === "delete" ? "destructive" : "outline"}
              onClick={() => run(a)}
            >
              {a}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-elevated text-xs text-muted-foreground">
              <tr>
                <th className="w-8 p-2"></th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Slug</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-right">Views</th>
                <th className="p-2 text-right">Attempts</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-border/50 hover:bg-surface-elevated/40">
                  <td className="p-2">
                    <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggle(t.id)} />
                  </td>
                  <td className="p-2">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.featured && "★ "}
                      {t.pinned && "📌 "}
                      {t.category}
                    </div>
                  </td>
                  <td className="p-2 font-mono text-xs">{t.slug}</td>
                  <td className="p-2">
                    <Badge variant={t.status === "published" ? "default" : "outline"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-2 text-right tabular-nums">{t.views_count ?? 0}</td>
                  <td className="p-2 text-right tabular-nums">{t.attempts_count ?? 0}</td>
                  <td className="p-2">
                    <Link
                      to={`/test/${t.slug}` as any}
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
