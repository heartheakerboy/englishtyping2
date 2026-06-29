// Balloon Burst — relaxed arcade typing.
// Balloons rise from the bottom carrying a word.
// Type a balloon's word before it leaves the top of the screen.
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { GameShell, type GameStatus } from "@/components/games/GameShell";
import { StartPanel, type Difficulty } from "@/components/games/StartPanel";
import { GameOverPanel } from "@/components/games/GameOverPanel";
import { GameLeaderboard } from "@/components/games/GameLeaderboard";
import { useGameAudio } from "@/components/games/useGameAudio";
import { pickWord } from "@/lib/game-words";
import { supabase } from "@/integrations/supabase/client";
import balloonImg from "@/assets/games/balloon.png";

export const Route = createFileRoute("/games/balloon-burst")({
  head: () => ({
    meta: [
      { title: "Balloon Burst — Typing Game" },
      {
        name: "description",
        content:
          "Pop floating balloons by typing their word before they drift away. Combo scoring and leaderboards.",
      },
      { property: "og:title", content: "Balloon Burst" },
    ],
    links: [{ rel: "canonical", href: "/games/balloon-burst" }],
  }),
  component: BalloonPage,
});

const SLUG = "balloon-burst";
const FIELD_H = 520;

type Balloon = { id: number; text: string; x: number; y: number; speed: number; hue: number };

function BalloonPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Balloon Burst</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pop each balloon by typing its word before it floats away.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Game />
          <GameLeaderboard slug={SLUG} />
        </div>
      </main>
    </div>
  );
}

function Game() {
  const audio = useGameAudio();
  const [status, setStatus] = useState<GameStatus>("idle");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(5);
  const [wave, setWave] = useState(1);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [input, setInput] = useState("");
  const [pops, setPops] = useState<{ id: number; x: number; y: number }[]>([]);

  const startedAt = useRef(0);
  const totals = useRef({ correct: 0, typed: 0, words: 0 });
  const nextIdRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const lastFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bRef = useRef<Balloon[]>([]);
  const livesRef = useRef(5);
  const waveRef = useRef(1);
  const statusRef = useRef<GameStatus>("idle");
  useEffect(() => {
    bRef.current = balloons;
  }, [balloons]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  const fieldWidth = () => containerRef.current?.clientWidth ?? 800;

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setScore(0);
    setCombo(0);
    setWave(1);
    setLives(d === "easy" ? 7 : d === "hard" ? 3 : 5);
    setBalloons([]);
    setInput("");
    setPops([]);
    totals.current = { correct: 0, typed: 0, words: 0 };
    nextIdRef.current = 1;
    lastSpawnRef.current = 0;
    startedAt.current = performance.now();
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  const endGame = useCallback(() => {
    setStatus("over");
    audio.play("lose");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [audio]);

  useEffect(() => {
    if (status !== "playing") return;
    lastFrameRef.current = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(50, t - lastFrameRef.current) / 1000;
      lastFrameRef.current = t;

      const elapsed = (t - startedAt.current) / 1000;
      const w = 1 + Math.floor(elapsed / 20);
      if (w !== waveRef.current) {
        waveRef.current = w;
        setWave(w);
        audio.play("level");
      }

      const spawnEvery = Math.max(
        550,
        1500 - (w - 1) * 90 - (difficulty === "hard" ? 200 : difficulty === "easy" ? -150 : 0),
      );
      if (t - lastSpawnRef.current > spawnEvery && bRef.current.length < 8) {
        lastSpawnRef.current = t;
        const text = pickWord(difficulty, w, new Set(bRef.current.map((x) => x.text)));
        const pad = 50;
        const x = pad + Math.random() * Math.max(1, fieldWidth() - 2 * pad);
        const speed =
          28 +
          w * 4 +
          Math.random() * 8 +
          (difficulty === "hard" ? 14 : difficulty === "easy" ? -6 : 0);
        bRef.current = [
          ...bRef.current,
          {
            id: nextIdRef.current++,
            text,
            x,
            y: FIELD_H + 20,
            speed,
            hue: Math.floor(Math.random() * 360),
          },
        ];
      }

      let escaped = 0;
      const next: Balloon[] = [];
      for (const b of bRef.current) {
        const ny = b.y - b.speed * dt;
        if (ny < -40) escaped += 1;
        else next.push({ ...b, y: ny });
      }
      if (escaped > 0) {
        const newLives = Math.max(0, livesRef.current - escaped);
        livesRef.current = newLives;
        setLives(newLives);
        setCombo(0);
        audio.play("miss");
        if (newLives <= 0) {
          bRef.current = next;
          setBalloons(next);
          endGame();
          return;
        }
      }
      bRef.current = next;
      setBalloons(next);

      if (statusRef.current === "playing") rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, difficulty, audio, endGame]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== "playing") return;
    const v = e.target.value;
    if (v.endsWith(" ") || v.endsWith("\n")) {
      const guess = v.trim();
      if (!guess) {
        setInput("");
        return;
      }
      const idx = bRef.current.findIndex((b) => b.text === guess);
      totals.current.typed += guess.length + 1;
      if (idx >= 0) {
        const popped = bRef.current[idx];
        bRef.current = bRef.current.filter((_, i) => i !== idx);
        setBalloons(bRef.current);
        totals.current.correct += guess.length;
        totals.current.words += 1;
        const newCombo = combo + 1;
        const gained =
          8 +
          popped.text.length +
          Math.floor(newCombo * 2) +
          (newCombo > 0 && newCombo % 5 === 0 ? 50 : 0);
        setScore((s) => s + gained);
        setCombo(newCombo);
        audio.play("pop");
        const pid = nextIdRef.current++;
        setPops((p) => [...p, { id: pid, x: popped.x, y: popped.y }]);
        setTimeout(() => setPops((p) => p.filter((q) => q.id !== pid)), 500);
      } else {
        setCombo(0);
        audio.play("miss");
      }
      setInput("");
      return;
    }
    setInput(v);
  };

  const partial = input;
  const finalRun = useMemo(() => {
    const dur = Math.max(1, Math.round((performance.now() - startedAt.current) / 1000));
    const acc =
      totals.current.typed > 0 ? (totals.current.correct / totals.current.typed) * 100 : 100;
    const wpm = totals.current.correct / 5 / (dur / 60);
    return {
      slug: SLUG,
      score,
      wpm,
      accuracy: acc,
      duration_seconds: dur,
      level_reached: wave,
      combo_max: combo,
      words_typed: totals.current.words,
      difficulty,
    } as const;
  }, [status, score, wave, combo, difficulty]); // eslint-disable-line

  return (
    <GameShell
      title="Balloon Burst"
      status={status}
      score={score}
      combo={combo}
      lives={lives}
      level={wave}
      muted={audio.muted}
      onToggleMute={() => audio.setMuted(!audio.muted)}
      onPause={() => setStatus("paused")}
      onResume={() => {
        setStatus("playing");
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
      onRestart={() => reset(difficulty)}
      shortcuts={
        <>
          Type a balloon's word + <kbd className="rounded border px-1">Space</kbd> to pop
        </>
      }
    >
      <div
        ref={containerRef}
        className="relative h-[520px] w-full overflow-hidden bg-[linear-gradient(180deg,#062536_0%,#0a4769_60%,#0c5c84_100%)]"
      >
        {/* clouds */}
        <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_30%,white,transparent_22%),radial-gradient(circle_at_50%_70%,white,transparent_18%)]" />

        {balloons.map((b) => {
          const matchLen = b.text.startsWith(partial) ? partial.length : 0;
          return (
            <div
              key={b.id}
              style={{ transform: `translate3d(${b.x - 40}px, ${b.y}px, 0)` }}
              className="absolute left-0 top-0 flex flex-col items-center"
            >
              <div className="relative" style={{ filter: `hue-rotate(${b.hue}deg)` }}>
                <img
                  src={balloonImg}
                  alt=""
                  className="h-20 w-20 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                  draggable={false}
                />
              </div>
              <div className="mt-1 rounded-md border border-white/20 bg-black/40 px-2 py-0.5 font-mono text-xs text-white shadow">
                <span className="text-amber-300">{b.text.slice(0, matchLen)}</span>
                <span>{b.text.slice(matchLen)}</span>
              </div>
            </div>
          );
        })}

        {pops.map((p) => (
          <div
            key={p.id}
            style={{ transform: `translate3d(${p.x - 20}px, ${p.y}px, 0)` }}
            className="absolute left-0 top-0 animate-ping text-2xl"
          >
            💥
          </div>
        ))}

        {status === "playing" && (
          <div className="absolute inset-x-0 bottom-4 grid place-items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={onChange}
              autoFocus
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="type + space"
              className="w-72 rounded-lg border border-white/30 bg-black/40 px-4 py-2 text-center font-mono text-sm text-white outline-none ring-amber-400/40 placeholder:text-white/50 focus:ring-2"
            />
          </div>
        )}

        {status === "idle" && (
          <StartPanel
            title="Balloon Burst"
            subtitle="Pop balloons before they drift away. Every 5 combo grants +50."
            onStart={reset}
          />
        )}
        {status === "over" && (
          <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm">
            <GameOverPanel run={finalRun} onRestart={() => reset(difficulty)} />
          </div>
        )}
      </div>
    </GameShell>
  );
}
