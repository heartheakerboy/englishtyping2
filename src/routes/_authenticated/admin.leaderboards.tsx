import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminLeaderboardSummary } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/leaderboards")({ component: LBPage });

function LBPage() {
  const list = useServerFn(adminLeaderboardSummary);
  const { data } = useQuery({ queryKey: ["admin-lb"], queryFn: () => list() });
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboards</h1>
        <p className="text-sm text-muted-foreground">Top 50 by best WPM.</p>
      </header>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Country</th>
              <th className="p-3 text-right">Level</th>
              <th className="p-3 text-right">Best WPM</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u: any, i: number) => (
              <tr key={u.id} className="border-t border-border/40">
                <td className="p-3 text-muted-foreground">{i + 1}</td>
                <td className="p-3">{u.display_name ?? u.username ?? u.id.slice(0, 8)}</td>
                <td className="p-3">{u.country ?? "—"}</td>
                <td className="p-3 text-right">{u.level}</td>
                <td className="p-3 text-right font-semibold">{u.best_wpm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
