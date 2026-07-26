// Falling Words — arcade typing.
// Words spawn at the top and drift down at increasing speed.
// Type any active word to vaporize it. Misses cost lives.
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
import { Zap, Keyboard } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/games/falling-words")({
  head: () => ({
    meta: [
      { title: "Falling Words — Typing Game" },
      {
        name: "description",
        content:
          "Type the falling words before they hit the ground. Endless waves, combo multiplier and global leaderboards.",
      },
      { property: "og:title", content: "Falling Words — Typing Game" },
    ],
    links: [{ rel: "canonical", href: "/games/falling-words" }],
  }),
  component: FallingWordsPage,
});

const SLUG = "falling-words";
const FIELD_H = 520; // px
const SPAWN_BASE = 1500;

type Word = { id: number; text: string; x: number; y: number; speed: number; typed: number };

function FallingWordsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <Breadcrumbs />
        <h1 className="font-display text-3xl font-semibold md:text-4xl mt-4">Falling Words</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Type before they hit the floor. Speed ramps every wave.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Game />
          <GameLeaderboard slug={SLUG} />
        </div>

        {/* Informational Guide & FAQs */}
        <section className="mt-16 border-t border-border/40 pt-12 max-w-4xl space-y-12">
          {/* Guide content */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Falling Words: Master Touch Typing Under Real-Time Pressure</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              If you want to transition from slow, conscious typing to rapid, sub-conscious touch typing, 
              <strong> Falling Words</strong> is the ultimate training ground. This arcade-style game drops words from the 
              top of your screen at accelerating velocities, forcing you to type them before they touch the ground. 
              By shifting your focus to the falling targets, your brain builds automated reflex pathways—commonly called 
              muscle memory. You no longer have time to look at your fingers; instead, your eyes feed the visual spelling 
              directly to your hands.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Before jumping into intensive arcade sprints, we recommend checking your current speed and accuracy on the 
              <SmartLink href="/typing-test" className="text-primary hover:underline font-semibold font-display">standard online typing test</SmartLink> to 
              set a performance baseline. This helps you track how many WPM you gain through gamified practice.
            </p>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-primary">
                  <Zap className="h-5 w-5" />
                  Visual Tracking & Automaticity
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In Falling Words, words fall down vertical tracks. This trains your eyes to remain fixed on the screen, 
                  breaking the bad habit of looking down at your keyboard. As waves progress, spawn intervals decrease and 
                  speeds increase. This pressure forces your fingers to type familiar letter sequences automatically, bypassing 
                  cognitive hesitation.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-success">
                  <Keyboard className="h-5 w-5" />
                  Tactical Typing Strategies
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To achieve high scores on the global leaderboards, focus on target prioritization. Always target the lowest 
                  words first, as they represent the most immediate threat. If a word starts with the same letters you've already 
                  typed, type the spacebar to reset your input and clear the correct target. Maintain a steady, calm breathing 
                  pace to prevent typo panic.
                </p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              If you find yourself struggling with specific key groupings, step away from the arcade and isolate row patterns 
              in the <SmartLink href="/games/trainer" className="text-primary hover:underline font-semibold">interactive keyboard trainer</SmartLink> or 
              test your raw cognitive sequencing under strict color recall constraints in the <SmartLink href="/games/memory" className="text-primary hover:underline font-semibold">visual recall memory drill</SmartLink>. 
              Furthermore, you can measure physical motor responses on the <SmartLink href="/games/reaction" className="text-primary hover:underline">reflex reaction test</SmartLink>, 
              or challenge physical mashing limits on the <SmartLink href="/games/cps" className="text-primary hover:underline">clicks per second test</SmartLink> and 
              the <SmartLink href="/games/spacebar" className="text-primary hover:underline">spacebar speed check</SmartLink>.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Explore our full catalog of games in the 
              <SmartLink href="/games" className="text-primary hover:underline font-semibold font-display">arcade typing games directory</SmartLink> to 
              diversify your daily practice routine.
            </p>
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  How does Falling Words help with touch typing?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Touch typing requires typing without looking at the keyboard. Falling Words forces your eyes to track targets on the screen under a time limit, which quickly overrides the urge to look down at your hands.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  Is it better to type fast or focus on accuracy in this game?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Accuracy is vital. Missed keystrokes break your combo multiplier and delay your firing time. Typing at a steady, accurate pace is much more effective for high scores than typing in erratic bursts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  How do I reset my current typed word in the game?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  If you make a typo or want to target a different word, simply hit the Spacebar. This clears your input buffer and allows you to start typing a new target immediately.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  Can I choose the difficulty level in Falling Words?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Yes, the game offers Easy, Medium, and Hard difficulty configurations on the start panel. Easy grants 5 lives and slower speeds, while Hard reduces your lives to 2 and accelerates word spawning.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
    </div>
  );
}

function Game() {
  const audio = useGameAudio();
  const [status, setStatus] = useState<GameStatus>("idle");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [words, setWords] = useState<Word[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const startedAt = useRef<number>(0);
  const totalCharsRef = useRef({ correct: 0, typed: 0, words: 0 });
  const nextIdRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const lastFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable refs so the animation loop reads fresh values without re-subscribing
  const wordsRef = useRef<Word[]>([]);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
  const statusRef = useRef<GameStatus>("idle");
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);
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
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  const fieldWidth = useCallback(() => containerRef.current?.clientWidth ?? 800, []);

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setScore(0);
    setCombo(0);
    setWave(1);
    setLives(d === "easy" ? 5 : d === "hard" ? 2 : 3);
    setWords([]);
    setInput("");
    totalCharsRef.current = { correct: 0, typed: 0, words: 0 };
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

  // RAF loop
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

      // Spawn
      const spawnEvery = Math.max(
        450,
        SPAWN_BASE -
          (w - 1) * 120 -
          (difficulty === "hard" ? 250 : difficulty === "easy" ? -200 : 0),
      );
      if (t - lastSpawnRef.current > spawnEvery && wordsRef.current.length < 8) {
        lastSpawnRef.current = t;
        const exclude = new Set(wordsRef.current.map((x) => x.text));
        const text = pickWord(difficulty, w, exclude);
        const pad = 32;
        const widthEst = Math.max(80, text.length * 12 + 24);
        const maxX = Math.max(pad, fieldWidth() - widthEst - pad);
        const x = pad + Math.random() * Math.max(1, maxX - pad);
        const speed =
          38 +
          w * 6 +
          (difficulty === "hard" ? 18 : difficulty === "easy" ? -10 : 0) +
          Math.random() * 10;
        wordsRef.current = [
          ...wordsRef.current,
          { id: nextIdRef.current++, text, x, y: -20, speed, typed: 0 },
        ];
      }

      // Move
      let killedAny = false;
      const next: Word[] = [];
      for (const wd of wordsRef.current) {
        const ny = wd.y + wd.speed * dt;
        if (ny >= FIELD_H - 24) {
          killedAny = true;
        } else {
          next.push({ ...wd, y: ny });
        }
      }
      if (killedAny) {
        const lost = wordsRef.current.length - next.length;
        const newLives = Math.max(0, livesRef.current - lost);
        livesRef.current = newLives;
        setLives(newLives);
        setCombo(0);
        audio.play("miss");
        if (newLives <= 0) {
          wordsRef.current = next;
          setWords(next);
          endGame();
          return;
        }
      }
      wordsRef.current = next;
      setWords(next);

      if (statusRef.current === "playing") rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, difficulty, audio, endGame, fieldWidth]);

  // Input
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (status !== "playing") return;
    // Strip whitespace; whitespace triggers commit-attempt
    if (v.endsWith(" ") || v.endsWith("\n")) {
      const guess = v.trim();
      if (!guess) {
        setInput("");
        return;
      }
      const idx = wordsRef.current.findIndex((w) => w.text === guess);
      totalCharsRef.current.typed += guess.length + 1;
      if (idx >= 0) {
        const killed = wordsRef.current[idx];
        wordsRef.current = wordsRef.current.filter((_, i) => i !== idx);
        setWords(wordsRef.current);
        totalCharsRef.current.correct += guess.length;
        totalCharsRef.current.words += 1;
        const newCombo = combo + 1;
        const gained = 10 + killed.text.length + Math.floor(newCombo * 2);
        setScore((s) => s + gained);
        setCombo(newCombo);
        audio.play("hit");
      } else {
        setCombo(0);
        audio.play("miss");
      }
      setInput("");
      return;
    }
    setInput(v);
  };

  // Pause/resume hotkeys via shell
  const onPause = () => setStatus("paused");
  const onResume = () => {
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const onRestart = () => reset(difficulty);

  const elapsedSec = useMemo(
    () => Math.max(1, Math.round((performance.now() - startedAt.current) / 1000)),
    [status],
  ); // eslint-disable-line

  const finalRun = useMemo(() => {
    const dur = Math.max(1, Math.round((performance.now() - startedAt.current) / 1000));
    const acc =
      totalCharsRef.current.typed > 0
        ? (totalCharsRef.current.correct / totalCharsRef.current.typed) * 100
        : 100;
    const wpm = totalCharsRef.current.correct / 5 / (dur / 60);
    return {
      slug: SLUG,
      score,
      wpm,
      accuracy: acc,
      duration_seconds: dur,
      level_reached: wave,
      combo_max: combo,
      words_typed: totalCharsRef.current.words,
      difficulty,
    } as const;
  }, [score, wave, combo, difficulty, status]); // eslint-disable-line

  // active-word matching highlight
  const partial = input;

  return (
    <GameShell
      title="Falling Words"
      status={status}
      score={score}
      combo={combo}
      lives={lives}
      level={wave}
      muted={audio.muted}
      onToggleMute={() => audio.setMuted(!audio.muted)}
      onPause={onPause}
      onResume={onResume}
      onRestart={onRestart}
      shortcuts={
        <>
          Type word + <kbd className="rounded border px-1">Space</kbd> to fire · Esc pauses
        </>
      }
    >
      <div
        ref={containerRef}
        className="relative h-[520px] w-full overflow-hidden bg-[radial-gradient(circle_at_top,theme(colors.primary/15),transparent_60%)]"
      >
        {/* Floor */}
        <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-rose-500/40 via-amber-500/40 to-rose-500/40" />
        {/* Words */}
        {words.map((w) => {
          const matchLen = w.text.startsWith(partial) ? partial.length : 0;
          return (
            <div
              key={w.id}
              style={{ transform: `translate3d(${w.x}px, ${w.y}px, 0)` }}
              className="absolute top-0 left-0 select-none rounded-md border border-border/60 bg-surface/90 px-3 py-1.5 font-mono text-sm shadow-glow backdrop-blur"
            >
              <span className="text-primary">{w.text.slice(0, matchLen)}</span>
              <span>{w.text.slice(matchLen)}</span>
            </div>
          );
        })}

        {/* Input */}
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
              placeholder="type a word + space"
              className="w-72 rounded-lg border border-border bg-background/90 px-4 py-2 text-center font-mono text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
        )}

        {status === "idle" && (
          <StartPanel
            title="Falling Words"
            subtitle="Type each word before it hits the floor."
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
