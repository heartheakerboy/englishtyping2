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
      { title: "English Typing Tests (1, 2, 5, 7, 10 & 15 Minutes) — Practice Online" },
      {
        name: "description",
        content:
          "Free online English typing tests for all durations: 60 seconds, 2 min, 5 min, 7 min (GCC-TBC exam format), 10 min paragraphs, and 15 min endurance. Live WPM, accuracy, CPM & leaderboards.",
      },
      {
        name: "keywords",
        content:
          "english typing test 5 minutes, english typing test 10 minutes, 7 minute typing test, typing test 2 minutes, 10 minutes typing practice paragraph, typing test english 5 minutes, english typing test 1 minute, timed typing test",
      },
      { property: "og:title", content: "English Typing Tests — 1, 2, 5, 7, 10 & 15 Min Practice" },
      {
        property: "og:description",
        content:
          "Pick your typing test duration (60s, 2m, 5m, 7m, 10m, 15m) and start typing paragraphs with real-time WPM, accuracy, and live leaderboards.",
      },
      { property: "og:url", content: "https://englishtypingtest.org/typing-test" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "English Typing Tests — 1, 2, 5, 7, 10 & 15 Min Practice" },
      {
        name: "twitter:description",
        content:
          "Free online typing tests for every duration. Real-time WPM, accuracy, CPM, and duration-specific leaderboards.",
      },
    ],
    links: [{ rel: "canonical", href: "https://englishtypingtest.org/typing-test" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "English Typing Tests by Duration",
          description:
            "Free online typing tests for 60 seconds, 2 minutes, 5 minutes, 7 minutes, 10 minutes, and 15 minutes.",
          url: "https://englishtypingtest.org/typing-test",
        }),
      },
    ],
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
