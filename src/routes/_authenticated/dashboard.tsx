import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { Header } from "@/components/Header";
import { listMyResults } from "@/lib/results.functions";
import {
  getMyProfile,
  myHeatmap,
  getMyAchievements,
  listAchievements,
} from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Activity, Target, Flame, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AccountStats } from "@/components/AccountStats";
import { Heatmap } from "@/components/Heatmap";

const resultsQuery = queryOptions({ queryKey: ["my-results"], queryFn: () => listMyResults() });
const profileQuery = queryOptions({ queryKey: ["my-profile"], queryFn: () => getMyProfile() });
const heatmapQuery = queryOptions({ queryKey: ["my-heatmap"], queryFn: () => myHeatmap() });
const myAchQuery = queryOptions({
  queryKey: ["my-achievements"],
  queryFn: () => getMyAchievements(),
});
const allAchQuery = queryOptions({ queryKey: ["achievements"], queryFn: () => listAchievements() });

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — englishtypingtest.org" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(resultsQuery);
    context.queryClient.ensureQueryData(profileQuery);
    context.queryClient.ensureQueryData(heatmapQuery);
    context.queryClient.ensureQueryData(myAchQuery);
    context.queryClient.ensureQueryData(allAchQuery);
  },
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Your dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track every test, watch your average climb.
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            <Link to="/test">
              New test <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Suspense fallback={<div className="mt-10 text-sm text-muted-foreground">Loading…</div>}>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}

function DashboardContent() {
  const { data: results } = useSuspenseQuery(resultsQuery);
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: heatmap } = useSuspenseQuery(heatmapQuery);
  const { data: myAch } = useSuspenseQuery(myAchQuery);
  const { data: allAch } = useSuspenseQuery(allAchQuery);

  const chartData = useMemo(() => {
    return [...(results ?? [])]
      .reverse()
      .slice(-40)
      .map((r, i) => ({
        i: i + 1,
        wpm: Number(r.wpm),
        raw: Number(r.raw_wpm),
        acc: Number(r.accuracy),
      }));
  }, [results]);

  if (!results || results.length === 0) {
    return (
      <>
        {profile && (
          <div className="mt-8">
            <AccountStats profile={profile as never} />
          </div>
        )}
        <Card className="mt-6 border-dashed border-border/60 bg-surface/30 p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl">No tests yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Take your first test to see your stats here.
          </p>
          <Button
            asChild
            className="mt-6 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            <Link to="/test">Start typing</Link>
          </Button>
        </Card>
      </>
    );
  }

  const count = results.length;
  const avgWpm = Math.round(results.reduce((a, r) => a + Number(r.wpm), 0) / count);
  const bestWpm = Math.max(...results.map((r) => Number(r.wpm)));
  const avgAcc =
    Math.round((results.reduce((a, r) => a + Number(r.accuracy), 0) / count) * 10) / 10;

  const unlockedCodes = new Set((myAch ?? []).map((a) => a.code));
  const recentUnlocked = (allAch ?? []).filter((a) => unlockedCodes.has(a.code)).slice(0, 6);
  const lockedNext = (allAch ?? []).filter((a) => !unlockedCodes.has(a.code)).slice(0, 3);

  return (
    <>
      {profile && (
        <div className="mt-8">
          <AccountStats profile={profile as never} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Flame} label="Best WPM" value={bestWpm} accent />
        <StatCard icon={Activity} label="Average WPM" value={avgWpm} />
        <StatCard icon={Target} label="Avg Accuracy" value={`${avgAcc}%`} />
        <StatCard icon={Trophy} label="Tests taken" value={count} />
      </div>

      <Card className="mt-8 border-border/60 bg-surface/40 p-5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Activity heatmap</h2>
          <span className="text-xs text-muted-foreground">Last 12 months</span>
        </div>
        <Heatmap data={heatmap ?? []} />
      </Card>

      <Card className="mt-8 border-border/60 bg-surface/40 p-5 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Progress over last {chartData.length} tests
          </h2>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> WPM
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Raw
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" /> Accuracy
            </span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="dashWpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.22 290)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.68 0.22 290)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="i"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="l"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="r"
                orientation="right"
                domain={[0, 100]}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--color-popover-foreground)",
                }}
              />
              <Area
                yAxisId="l"
                type="monotone"
                dataKey="wpm"
                stroke="oklch(0.68 0.22 290)"
                strokeWidth={2.5}
                fill="url(#dashWpm)"
              />
              <Line
                yAxisId="l"
                type="monotone"
                dataKey="raw"
                stroke="oklch(0.78 0.18 195)"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                yAxisId="r"
                type="monotone"
                dataKey="acc"
                stroke="oklch(0.7 0.17 150)"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-8 overflow-hidden border-border/60 bg-surface/40 backdrop-blur">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Recent tests</h2>
        </div>
        <div className="divide-y divide-border/60">
          <div className="grid grid-cols-6 gap-4 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div>When</div>
            <div>Mode</div>
            <div className="text-right">WPM</div>
            <div className="text-right">Raw</div>
            <div className="text-right">Accuracy</div>
            <div className="text-right">Consistency</div>
          </div>
          {results.slice(0, 25).map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-6 gap-4 px-6 py-3 text-sm transition-colors hover:bg-surface/60"
            >
              <div className="text-muted-foreground">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
              </div>
              <div className="font-mono text-xs">
                <span className="rounded bg-surface px-1.5 py-0.5">
                  {r.mode} {r.mode_value}
                </span>
              </div>
              <div className="text-right font-mono font-semibold text-primary tabular-nums">
                {Number(r.wpm).toFixed(0)}
              </div>
              <div className="text-right font-mono tabular-nums text-muted-foreground">
                {Number(r.raw_wpm).toFixed(0)}
              </div>
              <div className="text-right font-mono tabular-nums">
                {Number(r.accuracy).toFixed(1)}%
              </div>
              <div className="text-right font-mono tabular-nums text-muted-foreground">
                {r.consistency ? `${Number(r.consistency).toFixed(0)}%` : "—"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-8 border-border/60 bg-surface/40 p-5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold inline-flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Achievements
          </h2>
          <Link
            to="/achievements"
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          Unlocked{" "}
          <span className="font-mono text-foreground tabular-nums">{unlockedCodes.size}</span> of{" "}
          <span className="font-mono text-foreground tabular-nums">{(allAch ?? []).length}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {recentUnlocked.length === 0 && (
            <span className="text-sm text-muted-foreground">Take a test to start unlocking.</span>
          )}
          {recentUnlocked.map((a) => (
            <span
              key={a.code}
              className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs"
            >
              🏆 {a.name}
            </span>
          ))}
        </div>
        {lockedNext.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground">
            Next up: {lockedNext.map((a) => a.name).join(" • ")}
          </div>
        )}
      </Card>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className="border-border/60 bg-surface/40 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div
        className={`mt-2 font-display text-3xl font-semibold tabular-nums ${accent ? "text-gradient" : "text-foreground"}`}
      >
        {value}
      </div>
    </Card>
  );
}
