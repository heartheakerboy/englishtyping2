// Public leaderboard panel for a single game. Tabs over Daily / Weekly / Monthly / All-Time.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGameLeaderboard } from "@/lib/games.functions";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Period = "daily" | "weekly" | "monthly" | "all";
const TABS: { key: Period; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "all", label: "All time" },
];

export function GameLeaderboard({
  slug,
  highlightUserId,
}: {
  slug: string;
  highlightUserId?: string | null;
}) {
  const [period, setPeriod] = useState<Period>("daily");
  const q = useQuery({
    queryKey: ["game-leaderboard", slug, period],
    queryFn: () => getGameLeaderboard({ data: { slug, period, limit: 25 } }),
  });

  return (
    <Card className="border-border/60 bg-surface/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-base font-semibold">Leaderboard</div>
        <div className="flex gap-1 rounded-md border border-border bg-background p-0.5 text-xs">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setPeriod(t.key)}
              className={`rounded px-2 py-1 transition ${period === t.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded bg-surface" />
          ))}
        </div>
      ) : !q.data || q.data.length === 0 ? (
        <div className="grid place-items-center py-8 text-sm text-muted-foreground">
          No scores yet — be the first!
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {q.data.map((r: any) => {
            const mine = highlightUserId && r.user_id === highlightUserId;
            return (
              <li
                key={r.id}
                className={`flex items-center gap-3 py-2 ${mine ? "rounded bg-primary/5 px-2" : ""}`}
              >
                <span
                  className={`w-6 text-center text-xs tabular-nums ${r.rank <= 3 ? "font-semibold text-primary" : "text-muted-foreground"}`}
                >
                  {r.rank}
                </span>
                <Avatar className="h-7 w-7">
                  {r.avatar_url ? <AvatarImage src={r.avatar_url} alt="" /> : null}
                  <AvatarFallback className="text-[10px]">
                    {(r.display_name ?? "P").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 truncate text-sm">
                  {r.display_name}
                  {r.country ? (
                    <span className="ml-1 text-[10px] text-muted-foreground">{r.country}</span>
                  ) : null}
                </div>
                <div className="tabular-nums text-sm font-semibold">
                  {Number(r.score).toLocaleString()}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
