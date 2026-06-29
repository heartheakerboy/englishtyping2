// Shared "game over" panel: shows score, awards, rank, and CTAs.
// Used by every arcade game for consistent post-game polish.
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { submitGameScore } from "@/lib/games.functions";
import { Trophy, Coins, Zap, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FinalRun {
  slug: string;
  score: number;
  wpm: number;
  accuracy: number;
  duration_seconds: number;
  level_reached: number;
  combo_max: number;
  words_typed: number;
  difficulty: "easy" | "medium" | "hard";
  metadata?: Record<string, any>;
}

export function GameOverPanel({ run, onRestart }: { run: FinalRun; onRestart: () => void }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [result, setResult] = useState<{
    xp_awarded: number;
    coins_awarded: number;
    rank: number;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  const submit = useMutation({
    mutationFn: () => submitGameScore({ data: run }),
    onSuccess: (r: any) => {
      setResult(r);
      toast.success(`+${r.xp_awarded} XP · +${r.coins_awarded} coins`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not submit score"),
  });

  useEffect(() => {
    if (signedIn && !result && submit.status === "idle") submit.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  return (
    <div className="grid place-items-center p-6 text-center">
      <Trophy className="mb-2 h-10 w-10 text-amber-400" />
      <div className="font-display text-2xl font-semibold">Game over</div>
      <div className="mt-1 text-sm text-muted-foreground">
        Wave {run.level_reached} · {Math.round(run.wpm)} WPM · {Math.round(run.accuracy)}% accuracy
      </div>
      <div className="my-5 text-5xl font-bold tabular-nums text-primary drop-shadow">
        {run.score.toLocaleString()}
      </div>

      {signedIn ? (
        result ? (
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded-full bg-primary/10 px-3 py-1">
              <Zap className="mr-1 inline h-4 w-4 text-primary" />+{result.xp_awarded} XP
            </span>
            <span className="rounded-full bg-amber-500/10 px-3 py-1">
              <Coins className="mr-1 inline h-4 w-4 text-amber-400" />+{result.coins_awarded} coins
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1">
              All-time rank <strong>#{result.rank}</strong>
            </span>
          </div>
        ) : submit.isPending ? (
          <div className="text-sm text-muted-foreground">Saving your score…</div>
        ) : null
      ) : (
        <div className="text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to save your score and earn XP.
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onRestart}>
          <RotateCcw className="mr-1 h-4 w-4" /> Play again
        </Button>
        <Button variant="outline" asChild>
          <Link to="/games">All games</Link>
        </Button>
      </div>
    </div>
  );
}
