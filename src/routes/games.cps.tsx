import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/games/cps")({
  head: () => ({
    meta: [
      { title: "Clicks Per Second Test — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Find your CPS — how many clicks per second can you land? Five-second sprint with a personal best tracker.",
      },
      { property: "og:title", content: "CPS Test — Clicks Per Second" },
      {
        property: "og:description",
        content:
          "Time-boxed click sprint that measures your clicks per second and saves your best score.",
      },
    ],
  }),
  component: CpsGame,
});

function CpsGame() {
  const DURATION = 5;
  const [clicks, setClicks] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const [best, setBest] = useState(0);
  const interval = useRef<number | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    const b = Number(localStorage.getItem("ett-cps-best") || 0);
    if (b) setBest(b);
  }, []);
  useEffect(
    () => () => {
      if (interval.current) window.clearInterval(interval.current);
    },
    [],
  );

  const click = () => {
    if (!running) {
      setRunning(true);
      setClicks(1);
      setRemaining(DURATION);
      startedAt.current = performance.now();
      interval.current = window.setInterval(() => {
        const left = Math.max(0, DURATION - (performance.now() - startedAt.current) / 1000);
        setRemaining(+left.toFixed(2));
        if (left <= 0) {
          if (interval.current) window.clearInterval(interval.current);
          setRunning(false);
          sfx.finish();
        }
      }, 50);
      sfx.click();
      return;
    }
    if (remaining <= 0) return;
    setClicks((c) => c + 1);
  };

  const cps = running || clicks ? +(clicks / DURATION).toFixed(2) : 0;
  useEffect(() => {
    if (!running && cps > best) {
      setBest(cps);
      localStorage.setItem("ett-cps-best", String(cps));
    }
  }, [running, cps, best]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-semibold">Clicks per second</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Click as fast as possible for {DURATION} seconds.
        </p>

        <Card
          onClick={click}
          className="mt-8 grid h-80 cursor-pointer select-none place-items-center border-border/60 bg-surface/40 text-center backdrop-blur transition-transform active:scale-[0.99]"
        >
          <div>
            <div className="font-display text-6xl font-bold text-gradient">{clicks}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {running
                ? `${remaining.toFixed(1)}s remaining`
                : clicks
                  ? `${cps} CPS · click to retry`
                  : "Click to start"}
            </div>
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <Stat label="CPS" value={cps} />
          <Stat label="Best CPS" value={best || "—"} />
          <Stat label="Total clicks" value={clicks} />
        </div>
        {clicks > 0 && !running && (
          <Button
            onClick={() => {
              setClicks(0);
              setRemaining(DURATION);
            }}
            variant="outline"
            className="mt-5"
          >
            Reset
          </Button>
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
