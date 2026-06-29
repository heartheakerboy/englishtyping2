import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/games/spacebar")({
  head: () => ({
    meta: [
      { title: "Spacebar Speed Test — englishtypingtest.org" },
      {
        name: "description",
        content:
          "How fast can you mash the spacebar in 10 seconds? Instant hit-count with a saved personal best.",
      },
      { property: "og:title", content: "Spacebar Speed Test" },
      {
        property: "og:description",
        content: "Ten-second spacebar challenge with live hit counter and personal best tracking.",
      },
    ],
  }),
  component: SpacebarGame,
});

function SpacebarGame() {
  const DURATION = 10;
  const [hits, setHits] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const startedAt = useRef(0);
  const interval = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (!running && remaining === DURATION) {
        setRunning(true);
        setHits(1);
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
      if (running) {
        setHits((h) => h + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (interval.current) window.clearInterval(interval.current);
    };
  }, [running, remaining]);

  const sps = running || hits ? +(hits / DURATION).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-semibold">Spacebar test</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Press the spacebar as fast as you can for {DURATION} seconds.
        </p>

        <Card className="mt-8 grid h-80 place-items-center border-border/60 bg-surface/40 text-center backdrop-blur">
          <div>
            <div className="font-display text-6xl font-bold text-gradient">{hits}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {running
                ? `${remaining.toFixed(1)}s remaining`
                : hits
                  ? `${sps} hits/s — press space to retry`
                  : "Press space to start"}
            </div>
          </div>
        </Card>
        <div className="mt-5 flex justify-center text-xs text-muted-foreground">
          <kbd className="rounded border border-border bg-surface px-2 py-1 font-mono">Space</kbd>
        </div>
      </main>
    </div>
  );
}
