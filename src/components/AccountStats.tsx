import { Card } from "@/components/ui/card";
import { Flame, Zap, Coins, Trophy } from "lucide-react";
import { levelProgress } from "@/lib/leveling";

export type AccountProfile = {
  xp: number;
  level: number;
  coins: number;
  current_streak: number;
  longest_streak: number;
  best_wpm: number | string;
  tests_completed: number;
};

export function AccountStats({ profile }: { profile: AccountProfile }) {
  const xp = profile.xp ?? 0;
  const prog = levelProgress(xp);
  return (
    <Card className="border-border/60 bg-surface/40 p-5 backdrop-blur">
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow font-display font-bold">
            {prog.level}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Level
            </div>
            <div className="font-display text-lg font-semibold leading-tight">
              Level {prog.level}
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {prog.current.toLocaleString()} / {prog.needed.toLocaleString()} XP
            </div>
          </div>
        </div>

        <div className="min-w-[180px] flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all"
              style={{ width: `${prog.pct}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <Chip
              icon={Flame}
              value={`${profile.current_streak}d streak`}
              accent="text-orange-400"
            />
            <Chip
              icon={Coins}
              value={`${profile.coins.toLocaleString()} coins`}
              accent="text-yellow-400"
            />
            <Chip
              icon={Zap}
              value={`${Number(profile.best_wpm).toFixed(0)} best`}
              accent="text-primary"
            />
            <Chip
              icon={Trophy}
              value={`${profile.tests_completed} tests`}
              accent="text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Chip({
  icon: Icon,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  accent: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-foreground">
      <Icon className={`h-3.5 w-3.5 ${accent}`} />
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
