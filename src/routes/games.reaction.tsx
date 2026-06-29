import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/games/reaction")({
  head: () => ({
    meta: [
      { title: "Reaction Time Test — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Test your reflexes — click the instant the screen flips green. Five rounds, instant millisecond results.",
      },
      { property: "og:title", content: "Reaction Time Test" },
      {
        property: "og:description",
        content: "Measure your reflex speed in milliseconds across five rounds.",
      },
    ],
  }),
  component: ReactionGame,
});

type Phase = "idle" | "waiting" | "go" | "early" | "result";

function ReactionGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const startedAt = useRef<number>(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const start = () => {
    setPhase("waiting");
    const delay = 1200 + Math.random() * 2800;
    timer.current = window.setTimeout(() => {
      setPhase("go");
      startedAt.current = performance.now();
    }, delay);
  };

  const click = () => {
    if (phase === "waiting") {
      if (timer.current) window.clearTimeout(timer.current);
      sfx.fail();
      setPhase("early");
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - startedAt.current);
      sfx.tick();
      setTimes((t) => [...t, ms]);
      if (times.length + 1 >= 5) setPhase("result");
      else setPhase("idle");
    }
  };

  const reset = () => {
    setTimes([]);
    setPhase("idle");
  };

  const best = times.length ? Math.min(...times) : 0;
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-semibold">Reaction time</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Click when the box turns. 5 rounds. Don't click early.
        </p>

        <Card
          onClick={phase === "idle" || phase === "early" || phase === "result" ? start : click}
          className={`mt-8 grid h-80 cursor-pointer place-items-center text-center transition-colors ${
            phase === "go"
              ? "bg-success/30 border-success/60"
              : phase === "waiting"
                ? "bg-destructive/15 border-destructive/40"
                : phase === "early"
                  ? "bg-destructive/30 border-destructive/60"
                  : "border-border/60 bg-surface/40"
          }`}
        >
          <div>
            <div className="font-display text-3xl font-semibold">
              {phase === "idle" && "Click to start"}
              {phase === "waiting" && "Wait for green…"}
              {phase === "go" && "CLICK!"}
              {phase === "early" && "Too early — click to retry"}
              {phase === "result" && "Done"}
            </div>
            {times.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Round {times.length + (phase === "result" ? 0 : 0)}/5 · last {times.at(-1)} ms
              </div>
            )}
          </div>
        </Card>

        {times.length > 0 && (
          <Card className="mt-6 border-border/60 bg-surface/40 p-5 backdrop-blur">
            <div className="flex flex-wrap gap-6 text-sm">
              <Stat label="Best" value={`${best} ms`} />
              <Stat label="Average" value={`${avg} ms`} />
              <Stat label="Attempts" value={times.length} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {times.map((t, i) => (
                <span key={i} className="rounded-full bg-surface px-2 py-1 text-xs font-mono">
                  {t} ms
                </span>
              ))}
            </div>
            {phase === "result" && (
              <Button
                onClick={reset}
                className="mt-4 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                Try again
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
