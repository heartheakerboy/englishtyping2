import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import { leaderboard } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Globe2, Flag, MapPin, Building2, Loader2 } from "lucide-react";

type Scope = "global" | "country" | "state" | "city";
type Timeframe = "daily" | "weekly" | "monthly" | "all";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Global, country, state and city typing leaderboards. Compete daily, weekly, monthly and all-time.",
      },
      { property: "og:title", content: "Typing leaderboards" },
      {
        property: "og:description",
        content:
          "Compete on global, country, state and city typing leaderboards across daily, weekly, monthly and all-time windows.",
      },
      { property: "og:url", content: "/leaderboard" },
    ],
    links: [{ rel: "canonical", href: "/leaderboard" }],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("global");
  const [scopeValue, setScopeValue] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const fn = useServerFn(leaderboard);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["leaderboard", scope, scopeValue, timeframe],
    queryFn: () => fn({ data: { scope, scopeValue: scopeValue || undefined, timeframe } }),
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Leaderboards
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">The fastest typists, ranked.</p>
          </div>
          <Trophy className="h-8 w-8 text-primary" />
        </div>

        <Card className="mt-8 border-border/60 bg-surface/40 p-4 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-md bg-surface p-1">
              {(["global", "country", "state", "city"] as Scope[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${scope === s ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
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
                placeholder={`Filter by ${scope}…`}
                className="max-w-[200px]"
              />
            )}

            <div className="flex rounded-md bg-surface p-1">
              {(["daily", "weekly", "monthly", "all"] as Timeframe[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${timeframe === t ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t === "all" ? "All time" : t}
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </Card>

        <Card className="mt-6 overflow-hidden border-border/60 bg-surface/40 backdrop-blur">
          <div className="grid grid-cols-[60px_1fr_120px_100px_120px] gap-2 border-b border-border/60 px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground md:grid-cols-[60px_1fr_140px_100px_120px_120px]">
            <div>#</div>
            <div>Typist</div>
            <div className="hidden md:block">Location</div>
            <div className="text-right">Level</div>
            <div className="text-right">Tests</div>
            <div className="text-right">WPM</div>
          </div>
          {(!data || data.length === 0) && !isFetching && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No entries yet — be the first.
            </div>
          )}
          {data?.map((row) => (
            <div
              key={row.id}
              className={`grid grid-cols-[60px_1fr_120px_100px_120px] items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-surface/60 md:grid-cols-[60px_1fr_140px_100px_120px_120px] ${row.rank <= 3 ? "border-l-2 border-primary" : "border-l-2 border-transparent"}`}
            >
              <div className="font-mono text-sm font-semibold tabular-nums">
                {row.rank === 1
                  ? "🥇"
                  : row.rank === 2
                    ? "🥈"
                    : row.rank === 3
                      ? "🥉"
                      : `#${row.rank}`}
              </div>
              <div className="min-w-0 truncate">
                {row.username ? (
                  <Link
                    to="/u/$username"
                    params={{ username: row.username }}
                    className="font-medium hover:text-primary"
                  >
                    {row.display_name || row.username}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Anonymous</span>
                )}
                {row.username && (
                  <span className="ml-1.5 text-xs text-muted-foreground">@{row.username}</span>
                )}
              </div>
              <div className="hidden truncate text-xs text-muted-foreground md:block">
                {[row.city, row.state, row.country].filter(Boolean).join(", ") || "—"}
              </div>
              <div className="text-right text-xs text-muted-foreground tabular-nums">
                Lv {row.level}
              </div>
              <div className="text-right text-xs text-muted-foreground tabular-nums">
                {row.tests_completed}
              </div>
              <div className="text-right font-mono text-base font-semibold tabular-nums text-primary">
                {row.wpm.toFixed(0)}
              </div>
            </div>
          ))}
        </Card>
      </main>
    </div>
  );
}
