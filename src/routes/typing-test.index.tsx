import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Clock, Sparkles, Star, TrendingUp } from "lucide-react";
import { listEnabledDurations } from "@/lib/test-durations.functions";

export const Route = createFileRoute("/typing-test/")({
  head: () => ({
    meta: [
      { title: "Typing Tests — All Durations (15s, 30s, 1m, 5m, 10m…)" },
      {
        name: "description",
        content:
          "Free online typing tests for every duration — from a 15-second sprint to a 15-minute endurance test. Real-time WPM, accuracy, CPM and leaderboards.",
      },
      { property: "og:title", content: "Typing Tests — All Durations" },
      {
        property: "og:description",
        content:
          "Pick a typing test duration and start typing. Free, accurate WPM and leaderboards.",
      },
      { property: "og:url", content: "/typing-test" },
    ],
    links: [{ rel: "canonical", href: "/typing-test" }],
  }),
  component: Page,
});

function Page() {
  const fetchList = useServerFn(listEnabledDurations);
  const { data } = useQuery({ queryKey: ["public-durations"], queryFn: () => fetchList() });
  const items = data ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-20 md:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          <span className="mx-1">/</span> <span className="text-foreground">Typing Tests</span>
        </nav>
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Typing Tests — Choose your duration
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            From a 15-second warmup to a 15-minute endurance run, pick a test, measure your WPM and
            accuracy, and climb the duration-specific leaderboard.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <Link key={d.id} to="/typing-test/$slug" params={{ slug: d.slug }} className="group">
              <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-glow">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    {d.featured && (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                        <Star className="mr-0.5 inline h-3 w-3" />
                        Featured
                      </span>
                    )}
                    {d.popular && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                        <TrendingUp className="mr-0.5 inline h-3 w-3" />
                        Popular
                      </span>
                    )}
                    {d.is_new && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <Sparkles className="mr-0.5 inline h-3 w-3" />
                        New
                      </span>
                    )}
                  </div>
                </div>
                <h2 className="mt-3 text-lg font-semibold">{d.nav_label}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {d.meta_description}
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  {d.seconds ? `${d.seconds}s` : "Custom"} · {d.difficulty} · {d.category}
                </div>
              </Card>
            </Link>
          ))}
          {!items.length && (
            <p className="text-sm text-muted-foreground">No typing tests configured.</p>
          )}
        </div>
      </main>
    </div>
  );
}
