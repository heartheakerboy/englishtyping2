import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import { leaderboard } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Globe2, Flag, MapPin, Building2, Loader2, RefreshCw } from "lucide-react";

type Scope = "global" | "country" | "state" | "city";
type Timeframe = "daily" | "weekly" | "monthly" | "all";

export const Route = createFileRoute("/leaderboard")({
  loader: async () => {
    try {
      const initial = await leaderboard({ data: { scope: "global", timeframe: "all" } });
      return { initialLeaderboard: initial };
    } catch {
      return { initialLeaderboard: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Typing Speed Leaderboard — Global & Live Real Rankings" },
      {
        name: "description",
        content:
          "Live typing speed leaderboard. Real-time WPM rankings, fastest typists, and user performance statistics across daily, weekly, monthly, and all-time leaderboards.",
      },
      {
        name: "keywords",
        content:
          "typing leaderboard, real typing test leaderboard, englishtypingtest leaderboard india, typing speed rank, wpm dashboard, top typing speed rankings",
      },
      { property: "og:title", content: "Typing Speed Leaderboard — Global & Live Real Rankings" },
      {
        property: "og:description",
        content:
          "Live typing speed leaderboard. Real-time WPM rankings, fastest typists, and user performance statistics across daily, weekly, monthly, and all-time leaderboards.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/leaderboard" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Typing Speed Leaderboard — Global & Live Real Rankings" },
      {
        name: "twitter:description",
        content: "Track global and local typing champions. Compete and climb the real WPM rankings.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/leaderboard" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Global Typing Speed Leaderboard",
          description: "Real-time global, national, and city typing speed leaderboards.",
          url: "https://www.englishtypingtest.org/leaderboard",
        }),
      },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const loaderData = Route.useLoaderData();
  const [scope, setScope] = useState<Scope>("global");
  const [scopeValue, setScopeValue] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const fn = useServerFn(leaderboard);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["leaderboard", scope, scopeValue, timeframe],
    queryFn: () => fn({ data: { scope, scopeValue: scopeValue || undefined, timeframe } }),
    initialData:
      scope === "global" && !scopeValue && timeframe === "all"
        ? loaderData?.initialLeaderboard
        : undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-500 mb-2">
              <Trophy className="h-3.5 w-3.5" /> Official Rankings
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Typing Speed Leaderboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time user rankings by highest Net WPM, accuracy, and completed tests.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            Refresh
          </Button>
        </div>

        <Card className="mt-6 border-border/60 bg-surface/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg bg-surface border border-border/60 p-1">
                {(["global", "country", "state", "city"] as Scope[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      scope === s
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    {s === "global" ? (
                      <Globe2 className="h-3.5 w-3.5" />
                    ) : s === "country" ? (
                      <Flag className="h-3.5 w-3.5" />
                    ) : s === "state" ? (
                      <MapPin className="h-3.5 w-3.5" />
                    ) : (
                      <Building2 className="h-3.5 w-3.5" />
                    )}
                    {s}
                  </button>
                ))}
              </div>

              {scope !== "global" && (
                <Input
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  placeholder={`Search by ${scope}…`}
                  className="max-w-[200px] h-9 text-xs"
                />
              )}
            </div>

            <div className="flex rounded-lg bg-surface border border-border/60 p-1">
              {(["daily", "weekly", "monthly", "all"] as Timeframe[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    timeframe === t
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  {t === "all" ? "All Time" : t}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="mt-6 overflow-hidden border-border/70 bg-surface/30 shadow-xs">
          <div className="grid grid-cols-[60px_1fr_100px_100px] gap-2 border-b border-border/60 bg-surface-elevated/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid-cols-[60px_1fr_140px_90px_90px_110px]">
            <div>Rank</div>
            <div>Typist</div>
            <div className="hidden md:block">Location</div>
            <div className="hidden md:block text-right">Level</div>
            <div className="text-right">Tests</div>
            <div className="text-right">Best WPM</div>
          </div>

          {(!data || data.length === 0) && !isFetching && (
            <div className="px-4 py-16 text-center text-sm text-muted-foreground">
              No entries found for this filter. Start a typing test to be the first!
            </div>
          )}

          {data?.map((row: any) => {
            const displayName =
              row.display_name || row.username || `Typist #${row.id?.slice(0, 6) || "user"}`;
            const location =
              [row.city, row.state, row.country].filter(Boolean).join(", ") ||
              row.country ||
              "—";
            const wpmVal = Number(row.wpm || row.best_wpm || 0);

            return (
              <div
                key={row.id}
                className={`grid grid-cols-[60px_1fr_100px_100px] items-center gap-2 border-b border-border/30 px-4 py-3.5 text-sm transition-colors hover:bg-surface/70 md:grid-cols-[60px_1fr_140px_90px_90px_110px] last:border-b-0 ${
                  row.rank === 1
                    ? "bg-amber-500/5 border-l-2 border-amber-500"
                    : row.rank === 2
                      ? "border-l-2 border-slate-400"
                      : row.rank === 3
                        ? "border-l-2 border-orange-500"
                        : "border-l-2 border-transparent"
                }`}
              >
                <div className="font-mono text-sm font-bold tabular-nums">
                  {row.rank === 1
                    ? "🥇"
                    : row.rank === 2
                      ? "🥈"
                      : row.rank === 3
                        ? "🥉"
                        : `#${row.rank}`}
                </div>

                <div className="min-w-0 flex items-center gap-2.5 truncate">
                  {row.avatar_url ? (
                    <img
                      src={row.avatar_url}
                      alt={displayName}
                      className="h-7 w-7 rounded-full object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="truncate">
                    {row.username ? (
                      <Link
                        to="/u/$username"
                        params={{ username: row.username }}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {displayName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{displayName}</span>
                    )}

                    {row.username &&
                      row.display_name &&
                      row.username !== row.display_name && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          @{row.username}
                        </span>
                      )}
                  </div>
                </div>

                <div className="hidden truncate text-xs text-muted-foreground md:block">
                  {location}
                </div>

                <div className="hidden text-right text-xs font-medium text-muted-foreground tabular-nums md:block">
                  Lv {row.level ?? 1}
                </div>

                <div className="text-right text-xs text-muted-foreground tabular-nums">
                  {row.tests_completed ?? 0}
                </div>

                <div className="text-right font-mono text-base font-bold tabular-nums text-primary">
                  {wpmVal.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">WPM</span>
                </div>
              </div>
            );
          })}
        </Card>
      </main>
    </div>
  );
}
