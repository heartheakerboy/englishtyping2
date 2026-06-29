import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/games/trainer")({
  head: () => ({
    meta: [
      { title: "Keyboard Trainer — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Drill the home, top, bottom and number rows with focused key sprints to build muscle memory and speed.",
      },
      { property: "og:title", content: "Keyboard Trainer — Row Drills" },
      {
        property: "og:description",
        content:
          "Targeted row-by-row keyboard drills that build muscle memory for faster, more accurate typing.",
      },
    ],
  }),
  component: TrainerGame,
});

const KEY_GROUPS: Record<string, string[]> = {
  "Home row": ["a", "s", "d", "f", "j", "k", "l", ";"],
  "Top row": ["q", "w", "e", "r", "u", "i", "o", "p"],
  "Bottom row": ["z", "x", "c", "v", "n", "m", ",", "."],
  Numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
};

function pickStream(keys: string[], n = 40) {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(keys[Math.floor(Math.random() * keys.length)]);
  return out.join("");
}

function TrainerGame() {
  const [groupName, setGroupName] = useState<keyof typeof KEY_GROUPS>("Home row");
  const [target, setTarget] = useState("");
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTarget(pickStream(KEY_GROUPS[groupName]));
    setTyped("");
    setStartedAt(null);
    setFinished(false);
  }, [groupName]);
  useEffect(() => {
    if (!startedAt || finished) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startedAt, finished]);

  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const correct = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) c++;
    return c;
  }, [typed, target]);
  const wpm = elapsed > 0 ? Math.round((correct / 5) * (60 / elapsed)) : 0;
  const acc = typed.length ? Math.round((correct / typed.length) * 1000) / 10 : 100;

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    const v = e.target.value;
    if (!startedAt && v.length > 0) setStartedAt(Date.now());
    if (v.length > target.length) return;
    setTyped(v);
    if (v.length === target.length) {
      setFinished(true);
      sfx.finish();
    }
  };

  const reset = () => {
    setTarget(pickStream(KEY_GROUPS[groupName]));
    setTyped("");
    setStartedAt(null);
    setFinished(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-semibold">Keyboard trainer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drill specific keys at speed. Pick a group below.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {Object.keys(KEY_GROUPS).map((g) => (
            <Button
              key={g}
              size="sm"
              variant={g === groupName ? "default" : "outline"}
              onClick={() => setGroupName(g as keyof typeof KEY_GROUPS)}
            >
              {g}
            </Button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex gap-5 font-mono tabular-nums">
            <span>
              WPM <span className="text-primary">{wpm}</span>
            </span>
            <span>
              ACC <span className="text-foreground">{acc}%</span>
            </span>
            <span>
              Time <span className="text-foreground">{elapsed.toFixed(1)}s</span>
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            Restart
          </Button>
        </div>

        <Card
          className="mt-4 cursor-text border-border/60 bg-surface/30 p-6 font-mono text-2xl leading-relaxed backdrop-blur"
          onClick={() => inputRef.current?.focus()}
        >
          {target.split("").map((ch, i) => {
            const t = typed[i];
            const cls =
              t === undefined
                ? "text-typing-untyped"
                : t === ch
                  ? "text-typing-correct"
                  : "text-typing-incorrect underline decoration-typing-incorrect/60";
            const caret = i === typed.length;
            return (
              <span key={i} className={`relative ${cls}`}>
                {caret && !finished && (
                  <span
                    className="pointer-events-none absolute -left-px top-0 h-[1.4em] w-0.5 bg-typing-caret animate-caret"
                    aria-hidden
                  />
                )}
                {ch}
              </span>
            );
          })}
        </Card>
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handle}
          className="sr-only"
          autoFocus
        />
      </main>
    </div>
  );
}
