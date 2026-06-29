// Creator dashboard: list my custom tests with quick actions.
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  listMyTests,
  deleteCustomTest,
  duplicateTest,
  setTestStatus,
} from "@/lib/custom-tests.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Eye, BarChart3, Pencil, Archive, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/builder/")({
  component: BuilderDashboard,
  head: () => ({ meta: [{ title: "Test Builder — Create Custom Typing Tests" }] }),
});

function BuilderDashboard() {
  const list = useServerFn(listMyTests);
  const del = useServerFn(deleteCustomTest);
  const dup = useServerFn(duplicateTest);
  const status = useServerFn(setTestStatus);
  const router = useRouter();
  const [tests, setTests] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "draft" | "published" | "archived">("all");
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

  const filtered = filter === "all" ? tests : tests.filter((t) => t.status === filter);

  async function handleDelete(id: string) {
    if (!confirm("Delete this test?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    load();
  }
  async function handleDup(id: string) {
    await dup({ data: { id } });
    toast.success("Duplicated");
    load();
  }
  async function handleStatus(id: string, s: "draft" | "published" | "archived") {
    await status({ data: { id, status: s } });
    toast.success(s);
    load();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6 flex-1 w-full">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Test Builder</h1>
          <p className="text-sm text-muted-foreground">
            Create, manage, and analyze your custom typing tests.
          </p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground">
          <Link to={"/builder/new" as any}>
            <Plus className="mr-1 h-4 w-4" /> New Test
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "draft", "published", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md border px-3 py-1 text-xs capitalize ${filter === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {f}{" "}
            <span className="opacity-60">
              ({f === "all" ? tests.length : tests.filter((t) => t.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-16 text-center">
          <p className="text-muted-foreground">No tests yet.</p>
          <Button asChild className="mt-4 bg-gradient-primary text-primary-foreground">
            <Link to={"/builder/new" as any}>
              <Plus className="mr-1 h-4 w-4" /> Create your first test
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold">{t.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">/test/{t.slug}</p>
                </div>
                <Badge
                  variant={t.status === "published" ? "default" : "outline"}
                  className="capitalize"
                >
                  {t.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{t.duration_seconds}s</span>
                <span>· {t.difficulty}</span>
                <span>· {t.views_count ?? 0} views</span>
                <span>· {t.attempts_count ?? 0} attempts</span>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.navigate({ to: `/builder/${t.id}/edit` as any })}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.navigate({ to: `/builder/${t.id}/analytics` as any })}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </Button>
                {t.status === "published" && (
                  <a href={`/test/${t.slug}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleDup(t.id)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                {t.status !== "published" ? (
                  <Button size="sm" variant="ghost" onClick={() => handleStatus(t.id, "published")}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => handleStatus(t.id, "archived")}>
                    <Archive className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(t.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
