import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { fireConfetti } from "@/components/Confetti";

export const Route = createFileRoute("/games/memory")({
  head: () => ({
    meta: [
      { title: "Memory Sequence Game — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Repeat the lighting sequence as it grows. A simple Simon-style memory drill to sharpen recall and focus.",
      },
      { property: "og:title", content: "Memory Sequence Game" },
      {
        property: "og:description",
        content:
          "Simon-style memory drill — repeat the growing color sequence to set a new personal best.",
      },
    ],
  }),
  component: MemoryGame,
});

const PADS = [
  { id: 0, color: "bg-primary/70", active: "bg-primary" },
  { id: 1, color: "bg-success/70", active: "bg-success" },
  { id: 2, color: "bg-warning/70", active: "bg-warning" },
  { id: 3, color: "bg-destructive/70", active: "bg-destructive" },
];

function MemoryGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIdx, setUserIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const b = Number(localStorage.getItem("ett-mem-best") || 0);
    if (b) setBest(b);
  }, []);

  const playSeq = async (seq: number[]) => {
    setPlaying(true);
    for (const id of seq) {
      await new Promise((r) => setTimeout(r, 350));
      setLit(id);
      sfx.tick();
      await new Promise((r) => setTimeout(r, 350));
      setLit(null);
    }
    setPlaying(false);
    setUserIdx(0);
  };

  const start = () => {
    const next = [Math.floor(Math.random() * 4)];
    setSequence(next);
    setOver(false);
    setUserIdx(0);
    playSeq(next);
  };

  const handlePad = (id: number) => {
    if (playing || over || sequence.length === 0) return;
    if (sequence[userIdx] !== id) {
      sfx.fail();
      setOver(true);
      if (sequence.length - 1 > best) {
        setBest(sequence.length - 1);
        localStorage.setItem("ett-mem-best", String(sequence.length - 1));
      }
      return;
    }
    sfx.tick();
    if (userIdx + 1 >= sequence.length) {
      const next = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(next);
      if (next.length > best + 1) fireConfetti({ intensity: "low" });
      setTimeout(() => playSeq(next), 500);
    } else {
      setUserIdx((i) => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-semibold">Memory game</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Watch the sequence — repeat it back. It grows one step each round.
        </p>

        <Card className="mt-8 border-border/60 bg-surface/40 p-6 backdrop-blur">
          <div className="grid grid-cols-2 gap-3">
            {PADS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePad(p.id)}
                disabled={playing || over || sequence.length === 0}
                className={cn(
                  "h-32 rounded-2xl transition-all",
                  lit === p.id ? p.active + " scale-95 shadow-glow" : p.color,
                  "disabled:cursor-not-allowed",
                )}
              />
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Round <span className="font-mono text-foreground">{sequence.length}</span> · Best{" "}
              <span className="font-mono text-foreground">{best}</span>
            </div>
            <Button
              onClick={start}
              className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            >
              {sequence.length === 0 ? "Start" : over ? "Try again" : "Restart"}
            </Button>
          </div>
          {over && (
            <p className="mt-3 text-center text-sm text-destructive">Wrong pad — game over!</p>
          )}
        </Card>
      </main>
    </div>
  );
}
