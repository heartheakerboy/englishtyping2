import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeWeakness } from "@/lib/ai.functions";
import type { FinishedRun } from "@/components/TypingTest";

export function AICoachPanel({ run, language }: { run: FinishedRun; language: string }) {
  const analyze = useServerFn(analyzeWeakness);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [data, setData] = useState<{
    verdict: string;
    weaknesses: string[];
    drill: string;
    nextDifficulty: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setErr(null);
    const topMistakes = Object.entries(run.mistakeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) as [string, number][];
    analyze({
      data: {
        wpm: run.live.wpm,
        accuracy: run.live.accuracy,
        consistency: run.consistency,
        topMistakes,
        durationSeconds: run.durationSeconds,
        language,
      },
    })
      .then((r) => {
        if (!cancelled) {
          setData(r);
          setState("done");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setErr(e?.message ?? "AI coach unavailable");
          setState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [run, language, analyze]);

  return (
    <Card className="border-primary/30 bg-surface/50 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider">
          AI Typing Coach
        </h3>
      </div>
      {state === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Analysing your run…
        </div>
      )}
      {state === "error" && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {err}
        </div>
      )}
      {state === "done" && data && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <p className="text-sm text-foreground">{data.verdict}</p>
          {data.weaknesses.length > 0 && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                Focus areas
              </div>
              <ul className="space-y-1 text-sm">
                {data.weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.drill && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <div className="mb-1 text-[11px] uppercase tracking-wider text-primary">
                Next drill
              </div>
              {data.drill}
            </div>
          )}
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Suggested difficulty: <span className="text-foreground">{data.nextDifficulty}</span>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
