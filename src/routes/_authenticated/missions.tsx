import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listMissions, claimMission } from "@/lib/missions.functions";
import { Sparkles, Coins, Check, Gift, Loader2 } from "lucide-react";
import { fireConfetti } from "@/components/Confetti";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/_authenticated/missions")({
  head: () => ({ meta: [{ title: "Missions — englishtypingtest.org" }] }),
  component: MissionsPage,
});

function MissionsPage() {
  const qc = useQueryClient();
  const { data: missions, isLoading } = useQuery({
    queryKey: ["missions"],
    queryFn: () => listMissions(),
  });
  const claim = useServerFn(claimMission);
  const claimMut = useMutation({
    mutationFn: (v: { mission_id: string; period_key: string }) => claim({ data: v }),
    onSuccess: (r) => {
      sfx.finish();
      fireConfetti({ intensity: "medium" });
      toast.success(`+${r.xp} XP · +${r.coins} coins`);
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not claim"),
  });

  const groups: Record<string, typeof missions> = { daily: [], weekly: [], monthly: [] };
  for (const m of missions ?? []) groups[m.scope]?.push(m);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-12">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Missions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Earn XP and coins by completing daily, weekly, and monthly objectives.
        </p>

        {isLoading && <div className="mt-8 text-sm text-muted-foreground">Loading…</div>}

        {(["daily", "weekly", "monthly"] as const).map((scope) => (
          <section key={scope} className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold capitalize">{scope} missions</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {(groups[scope] ?? []).map((m) => {
                const pct = Math.min(100, Math.round((m.progress / m.threshold) * 100));
                const claimed = m.claimed;
                const ready = m.completed && !claimed;
                return (
                  <Card key={m.id} className="border-border/60 bg-surface/40 p-5 backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-semibold">{m.title}</h3>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </div>
                      <div className="text-right text-xs">
                        <div className="inline-flex items-center gap-1 text-primary">
                          <Sparkles className="h-3 w-3" /> {m.xp_reward}
                        </div>
                        <div className="inline-flex items-center gap-1 text-warning">
                          <Coins className="h-3 w-3" /> {m.coin_reward}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full bg-gradient-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">
                        {m.progress}/{m.threshold}
                      </span>
                      {claimed ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check className="h-3 w-3" /> Claimed
                        </span>
                      ) : ready ? (
                        <Button
                          size="sm"
                          disabled={claimMut.isPending}
                          onClick={() =>
                            claimMut.mutate({ mission_id: m.id, period_key: m.period_key })
                          }
                          className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                        >
                          {claimMut.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Gift className="h-3 w-3" />
                          )}{" "}
                          Claim
                        </Button>
                      ) : (
                        <span>{pct}%</span>
                      )}
                    </div>
                  </Card>
                );
              })}
              {(groups[scope] ?? []).length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground">No {scope} missions yet.</p>
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
