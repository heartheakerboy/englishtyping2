import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { listAchievements, getMyAchievements } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Trophy, Sparkles, Flame, Medal, Crown, Zap, Rocket, Target } from "lucide-react";

const allQuery = queryOptions({ queryKey: ["achievements"], queryFn: () => listAchievements() });
const mineQuery = queryOptions({
  queryKey: ["my-achievements"],
  queryFn: () => getMyAchievements(),
});

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({ meta: [{ title: "Achievements — englishtypingtest.org" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(allQuery);
    context.queryClient.ensureQueryData(mineQuery);
  },
  component: AchievementsPage,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  flame: Flame,
  medal: Medal,
  crown: Crown,
  zap: Zap,
  rocket: Rocket,
  bolt: Zap,
  target: Target,
  trophy: Trophy,
};

function AchievementsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-20">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Achievements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unlock badges as you climb. Earn XP and coins along the way.
        </p>
        <Suspense fallback={<div className="mt-10 text-sm text-muted-foreground">Loading…</div>}>
          <Grid />
        </Suspense>
      </main>
    </div>
  );
}

function Grid() {
  const { data: all } = useSuspenseQuery(allQuery);
  const { data: mine } = useSuspenseQuery(mineQuery);
  const unlocked = new Set((mine ?? []).map((m) => m.code));
  const byCategory = new Map<string, typeof all>();
  for (const a of all ?? []) {
    if (!byCategory.has(a.category)) byCategory.set(a.category, []);
    byCategory.get(a.category)!.push(a);
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="text-sm text-muted-foreground">
        Unlocked <span className="font-mono text-foreground tabular-nums">{unlocked.size}</span> of{" "}
        <span className="font-mono text-foreground tabular-nums">{(all ?? []).length}</span>
      </div>
      {Array.from(byCategory.entries()).map(([cat, items]) => (
        <div key={cat}>
          <h2 className="mb-3 font-display text-lg font-semibold capitalize">
            {cat.replace("-", " ")}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {items?.map((a) => {
              const Icon = iconMap[a.icon] ?? Trophy;
              const isUnlocked = unlocked.has(a.code);
              return (
                <Card
                  key={a.code}
                  className={`border-border/60 p-4 transition-all ${isUnlocked ? "bg-gradient-to-br from-primary/20 to-surface/40 shadow-glow" : "bg-surface/30 opacity-60"}`}
                >
                  <Icon
                    className={`h-7 w-7 ${isUnlocked ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div className="mt-3 font-display font-semibold">{a.name}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>+{a.xp_reward} XP</span>
                    <span>•</span>
                    <span>+{a.coins_reward} 🪙</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
