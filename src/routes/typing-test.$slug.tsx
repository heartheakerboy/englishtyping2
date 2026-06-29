import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TypingTest, type FinishedRun } from "@/components/TypingTest";
import { ResultScreen } from "@/components/ResultScreen";
import { useTestConfig } from "@/lib/test-store";
import {
  getDurationBySlug,
  getDurationLeaderboard,
  getMyDurationStats,
  listEnabledDurations,
  type TestDuration,
} from "@/lib/test-durations.functions";
import { ChevronRight, Clock, Play, Trophy, User as UserIcon } from "lucide-react";

function ErrorComponent({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Couldn't load this test</h1>
        <Button
          className="mt-4"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Retry
        </Button>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/typing-test/$slug")({
  loader: async ({ params }) => {
    const row = await getDurationBySlug({ data: { slug: params.slug } });
    if (!row) throw notFound();
    return { duration: row };
  },
  head: ({ params, loaderData }) => {
    const d = loaderData?.duration as TestDuration | undefined;
    const url = `/typing-test/${params.slug}`;
    if (!d) return { meta: [{ title: "Typing Test" }] };
    const faq = (d.faq ?? []).filter((f) => f.q && f.a);
    return {
      meta: [
        { title: d.title },
        { name: "description", content: d.meta_description },
        { property: "og:title", content: d.title },
        { property: "og:description", content: d.meta_description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(d.banner_url ? [{ property: "og:image", content: d.banner_url }] : []),
        { name: "twitter:card", content: d.banner_url ? "summary_large_image" : "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: d.h1,
            url,
            description: d.meta_description,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Typing Tests", item: "/typing-test" },
              { "@type": "ListItem", position: 3, name: d.nav_label, item: url },
            ],
          }),
        },
        ...(faq.length
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: Page,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Typing test not found</h1>
        <p className="mt-2 text-muted-foreground">
          That duration doesn't exist or has been disabled.
        </p>
        <Button asChild className="mt-4">
          <Link to="/typing-test">Browse all tests</Link>
        </Button>
      </main>
    </div>
  ),
  errorComponent: ErrorComponent,
});

function Page() {
  const { duration } = Route.useLoaderData();
  const [run, setRun] = useState<FinishedRun | null>(null);
  const [started, setStarted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const setCfg = useTestConfig((s) => s.set);

  useEffect(() => {
    let active = true;
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => {
        if (active) setSignedIn(!!data.session);
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const fetchList = useServerFn(listEnabledDurations);
  const fetchLb = useServerFn(getDurationLeaderboard);
  const fetchMine = useServerFn(getMyDurationStats);

  const { data: all } = useQuery({ queryKey: ["public-durations"], queryFn: () => fetchList() });
  const { data: lb } = useQuery({
    queryKey: ["dur-lb", duration.seconds],
    queryFn: () =>
      duration.seconds
        ? fetchLb({ data: { seconds: duration.seconds, limit: 20 } })
        : Promise.resolve([]),
    enabled: !!duration.seconds,
  });
  const { data: mine } = useQuery({
    queryKey: ["dur-mine", duration.seconds, signedIn],
    queryFn: () =>
      duration.seconds
        ? fetchMine({ data: { seconds: duration.seconds } }).catch(() => null)
        : Promise.resolve(null),
    enabled: !!duration.seconds && signedIn,
  });

  useEffect(() => {
    if (duration.kind === "custom") {
      setCfg({ mode: "custom" });
    } else if (duration.seconds) {
      setCfg({ mode: "time", timeSeconds: duration.seconds });
    }
  }, [duration.id, duration.kind, duration.seconds, setCfg]);

  const related = (all ?? []).filter((d) => d.id !== duration.id).slice(0, 6);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-20 md:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/typing-test" className="hover:text-foreground">
            Typing Tests
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{duration.nav_label}</span>
        </nav>

        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {duration.h1}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{duration.meta_description}</p>
            </div>
          </div>
          {duration.banner_url && (
            <img
              src={duration.banner_url}
              alt=""
              loading="lazy"
              className="mt-4 w-full rounded-xl object-cover"
            />
          )}
        </header>

        <AnimatePresence mode="wait">
          {run ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultScreen
                run={run}
                onRestart={() => {
                  setRun(null);
                  setStarted(true);
                }}
              />
            </motion.div>
          ) : started ? (
            <motion.div key="test" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TypingTest onFinish={setRun} />
            </motion.div>
          ) : (
            <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="flex flex-col items-center gap-4 p-10 text-center">
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Ready?</div>
                <div className="font-display text-5xl font-bold">
                  {duration.seconds ? `${duration.seconds}s` : "Custom"}
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-primary text-primary-foreground shadow-glow"
                  onClick={() => setStarted(true)}
                >
                  <Play className="mr-2 h-4 w-4" /> Start Test
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {duration.description_md && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">About this test</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {duration.description_md}
            </p>
          </section>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
              <Trophy className="h-5 w-5 text-amber-500" /> Leaderboard — {duration.nav_label}
            </h2>
            <Card className="divide-y divide-border">
              {(lb ?? []).length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">
                  No results yet. Be the first to set a record.
                </div>
              )}
              {(lb ?? []).map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 p-3 text-sm">
                  <div className="w-6 text-center font-mono text-xs text-muted-foreground">
                    {i + 1}
                  </div>
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt="" className="h-7 w-7 rounded-full" />
                  ) : (
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-surface">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="flex-1 truncate">{r.display_name}</div>
                  <div className="font-mono font-semibold">
                    {r.wpm.toFixed(0)} <span className="text-xs text-muted-foreground">WPM</span>
                  </div>
                  <div className="hidden font-mono text-xs text-muted-foreground sm:block">
                    {r.accuracy.toFixed(0)}%
                  </div>
                </div>
              ))}
            </Card>
          </section>

          <aside className="space-y-4">
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Personal best
              </div>
              <div className="mt-1 font-display text-3xl font-bold">
                {mine?.best ? mine.best.toFixed(0) : "—"}{" "}
                <span className="text-sm text-muted-foreground">WPM</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {mine?.recent?.length
                  ? `${mine.recent.length} recent attempts`
                  : "Sign in to track your progress."}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recent attempts
              </div>
              {(mine?.recent ?? []).length === 0 && (
                <div className="text-xs text-muted-foreground">No attempts yet.</div>
              )}
              <ul className="space-y-1.5 text-sm">
                {(mine?.recent ?? []).map((r) => (
                  <li key={r.id} className="flex items-center justify-between font-mono text-xs">
                    <span className="text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      {r.wpm.toFixed(0)} WPM · {r.accuracy.toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>

        <section className="mt-12">
          <h2 className="mb-3 font-display text-xl font-semibold">Similar typing tests</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {related.map((d) => (
              <Link key={d.id} to="/typing-test/$slug" params={{ slug: d.slug }}>
                <Card className="p-3 text-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-glow">
                  <Clock className="mx-auto h-4 w-4 text-primary" />
                  <div className="mt-1 font-medium">{d.nav_label}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-3 font-display text-xl font-semibold">Related practice</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/race"
              className="rounded-full border border-border px-3 py-1.5 hover:bg-surface"
            >
              Multiplayer Race
            </Link>
            <Link
              to="/games"
              className="rounded-full border border-border px-3 py-1.5 hover:bg-surface"
            >
              Typing Games
            </Link>
            <Link
              to="/tournaments"
              className="rounded-full border border-border px-3 py-1.5 hover:bg-surface"
            >
              Tournaments
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-full border border-border px-3 py-1.5 hover:bg-surface"
            >
              Global Leaderboard
            </Link>
          </div>
        </section>

        {(duration.faq ?? []).length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 font-display text-xl font-semibold">Frequently asked questions</h2>
            <div className="space-y-2">
              {duration.faq.map((f: { q: string; a: string }, i: number) => (
                <details
                  key={i}
                  className="group rounded-lg border border-border bg-surface p-3 open:bg-surface-elevated"
                >
                  <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-3 font-display text-xl font-semibold">All typing test durations</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {(all ?? []).map((d) => (
              <Link
                key={d.id}
                to="/typing-test/$slug"
                params={{ slug: d.slug }}
                className={`rounded-full border px-3 py-1.5 ${d.id === duration.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface"}`}
              >
                {d.nav_label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
