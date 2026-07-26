import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Trophy, RefreshCw } from "lucide-react";
import { STORIES, BOOKS, QUOTES } from "@/lib/corpus";
import { sfx } from "@/lib/sound";
import confetti from "canvas-confetti";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Brain, Target, HelpCircle, Sparkles, BookOpen } from "lucide-react";

export const Route = createFileRoute("/games/race-bots")({
  head: () => ({
    meta: [
      { title: "Type Racer — Race Against Bots | englishtypingtest.org" },
      {
        name: "description",
        content:
          "Race against AI typing bots in real time. Improve your WPM by outrunning opponents in a head-to-head typing race.",
      },
      { property: "og:title", content: "Type Racer — Race Against Bots" },
      {
        property: "og:description",
        content: "Head-to-head typing race against AI opponents. Boost your WPM and accuracy.",
      },
    ],
  }),
  component: RaceBotsGame,
});

type Bot = { id: string; name: string; color: string; wpm: number; progress: number };

const PARAGRAPHS = [
  ...STORIES,
  ...BOOKS,
  ...QUOTES.filter((q) => q.length !== "short").map((q) => q.text),
];

const COLORS = [
  { from: "#EF4444", to: "#F97316", name: "Crimson" },
  { from: "#06B6D4", to: "#14B8A6", name: "Cyan" },
  { from: "#22C55E", to: "#84CC16", name: "Lime" },
  { from: "#A855F7", to: "#EC4899", name: "Magenta" },
];

function CarSvg({ from, to }: { from: string; to: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      className="h-9 w-[72px] drop-shadow-[0_0_8px_rgba(0,0,0,0.35)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`g-${from}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="20" y="6" width="14" height="6" rx="2" fill="#0f172a" stroke={from} />
      <rect x="20" y="48" width="14" height="6" rx="2" fill="#0f172a" stroke={from} />
      <rect x="82" y="6" width="14" height="6" rx="2" fill="#0f172a" stroke={from} />
      <rect x="82" y="48" width="14" height="6" rx="2" fill="#0f172a" stroke={from} />
      <path
        d="M12 30 C12 18, 25 10, 60 10 C95 10, 108 20, 112 30 C108 40, 95 50, 60 50 C25 50, 12 42, 12 30 Z"
        fill={`url(#g-${from})`}
      />
      <path d="M65 18 C65 18, 85 22, 85 30 C85 38, 65 42, 65 42 Z" fill="#0f172a" opacity="0.75" />
      <circle cx="104" cy="20" r="2.5" fill="#fff" />
      <circle cx="104" cy="40" r="2.5" fill="#fff" />
    </svg>
  );
}

function makeBots(count: number): Bot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `bot-${i}`,
    name: `Bot ${i + 1}`,
    color: COLORS[i % COLORS.length].from,
    wpm: 30 + Math.round(Math.random() * 50), // 30-80 wpm
    progress: 0,
  }));
}

function RaceBotsGame() {
  const [paragraph, setParagraph] = useState(
    () => PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)],
  );
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "countdown" | "running" | "done">("idle");
  const [countdown, setCountdown] = useState(3);
  const [bots, setBots] = useState<Bot[]>(() => makeBots(3));
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const startedAt = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);

  const total = paragraph.length;
  const progress = Math.min(1, typed.length / total);
  const correctChars = useMemo(() => {
    let n = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === paragraph[i]) n++;
    return n;
  }, [typed, paragraph]);
  const wpm = elapsed > 0 ? Math.round(correctChars / 5 / (elapsed / 60)) : 0;
  const cpm = elapsed > 0 ? Math.round(correctChars / (elapsed / 60)) : 0;
  const accuracy = typed.length ? Math.round((correctChars / typed.length) * 100) : 100;

  // Race loop
  useEffect(() => {
    if (status !== "running") return;
    const tick = () => {
      const now = performance.now();
      const sec = (now - startedAt.current) / 1000;
      setElapsed(sec);
      setBots((prev) =>
        prev.map((b) => {
          const charsPerSec = (b.wpm * 5) / 60;
          // slight jitter
          const jitter = 0.85 + Math.random() * 0.3;
          const newProg = Math.min(1, b.progress + (charsPerSec * jitter * (1 / 60)) / total);
          return { ...b, progress: newProg };
        }),
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, total]);

  // Win condition
  useEffect(() => {
    if (status !== "running") return;
    if (progress >= 1) {
      finishRace("you");
      return;
    }
    const winBot = bots.find((b) => b.progress >= 1);
    if (winBot) finishRace(winBot.name);
  }, [progress, bots, status]);

  function finishRace(who: string) {
    setStatus("done");
    setWinner(who);
    sfx.finish();
    if (who === "you") {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  }

  // Focus input when race starts
  useEffect(() => {
    if (status === "running") {
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [status]);

  function startCountdown() {
    setTyped("");
    setMistakes(0);
    setElapsed(0);
    setWinner(null);
    setBots(makeBots(3));
    setCountdown(3);
    setStatus("countdown");
    let n = 3;
    const id = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(id);
        setStatus("running");
        startedAt.current = performance.now();
      }
      setCountdown(Math.max(n, 0));
    }, 1000);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (status !== "running") return;
    const v = e.target.value;
    if (v.length > paragraph.length) return;
    const lastIndex = v.length - 1;
    if (lastIndex >= 0 && v[lastIndex] !== paragraph[lastIndex] && v.length > typed.length) {
      setMistakes((m) => m + 1);
    }
    setTyped(v);
  }

  function newRace() {
    setParagraph(PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]);
    setStatus("idle");
    setTyped("");
    setMistakes(0);
    setElapsed(0);
    setWinner(null);
    setBots(makeBots(3));
  }

  const racers = [
    { id: "you", name: "You", color: "#6366f1", colorTo: "#8b5cf6", progress, wpm },
    ...bots.map((b, i) => ({
      id: b.id,
      name: b.name,
      color: COLORS[i % COLORS.length].from,
      colorTo: COLORS[i % COLORS.length].to,
      progress: b.progress,
      wpm: b.wpm,
    })),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">Type Racer</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Race against AI opponents. First to finish the paragraph wins.
            </p>
          </div>
          <div className="flex gap-2">
            {status === "idle" && (
              <Button onClick={startCountdown}>
                <Car className="mr-2 h-4 w-4" /> Start race
              </Button>
            )}
            {status === "done" && (
              <Button onClick={startCountdown}>
                <RefreshCw className="mr-2 h-4 w-4" /> Race again
              </Button>
            )}
            {status !== "idle" && (
              <Button variant="outline" onClick={newRace}>
                New paragraph
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Time" value={`${elapsed.toFixed(1)}s`} />
          <Stat label="WPM" value={wpm} />
          <Stat label="CPM" value={cpm} />
          <Stat label="Mistakes" value={mistakes} />
        </div>

        {/* Track */}
        <Card className="mt-6 overflow-hidden border-border/60 bg-surface/40 p-4 backdrop-blur md:p-6">
          <div className="space-y-3">
            {racers.map((r) => (
              <div key={r.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span
                    className={
                      r.id === "you" ? "font-semibold text-primary" : "text-muted-foreground"
                    }
                  >
                    {r.name}
                  </span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {Math.round(r.progress * 100)}% · {r.wpm} WPM
                  </span>
                </div>
                <div className="relative h-12 rounded-md border border-border/50 bg-gradient-to-r from-background to-surface-elevated">
                  {/* dashed lane */}
                  <div className="absolute left-0 right-10 top-1/2 -translate-y-1/2 border-t border-dashed border-border/60" />
                  {/* finish flag */}
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-base">🏁</div>
                  {/* car */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-150 ease-linear"
                    style={{ left: `calc(${r.progress * 100}% - 40px)` }}
                  >
                    <CarSvg from={r.color} to={r.colorTo} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Countdown overlay */}
        {status === "countdown" && (
          <div className="mt-6 grid place-items-center rounded-lg border border-border/60 bg-surface/40 py-10 backdrop-blur">
            <div className="font-display text-6xl font-bold text-gradient">{countdown}</div>
            <div className="mt-2 text-sm text-muted-foreground">Get ready…</div>
          </div>
        )}

        {/* Paragraph */}
        {status !== "idle" && (
          <Card className="mt-6 border-border/60 bg-surface/40 p-5 backdrop-blur md:p-6">
            <div className="select-none whitespace-pre-wrap break-words font-mono text-lg leading-relaxed md:text-xl">
              {paragraph.split("").map((ch, i) => {
                let cls = "text-muted-foreground/60";
                if (i < typed.length)
                  cls =
                    typed[i] === ch ? "text-foreground" : "text-red-500 bg-red-500/15 rounded-sm";
                else if (i === typed.length)
                  cls =
                    "text-foreground underline decoration-primary decoration-2 underline-offset-4";
                return (
                  <span key={i} className={cls}>
                    {ch}
                  </span>
                );
              })}
            </div>
            <input
              ref={inputRef}
              autoFocus
              value={typed}
              onChange={onChange}
              disabled={status !== "running"}
              className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
              placeholder={status === "running" ? "Type here…" : "Waiting…"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </Card>
        )}

        {/* Result */}
        {status === "done" && (
          <Card className="mt-6 border-border/60 bg-surface/40 p-6 text-center backdrop-blur">
            <Trophy
              className={`mx-auto h-10 w-10 ${winner === "you" ? "text-amber-400" : "text-muted-foreground"}`}
            />
            <div className="mt-2 font-display text-2xl font-semibold">
              {winner === "you" ? "You won the race!" : `${winner} won the race`}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {wpm} WPM · {accuracy}% accuracy · {mistakes} mistakes · {elapsed.toFixed(1)}s
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={startCountdown}>
                <RefreshCw className="mr-2 h-4 w-4" /> Race again
              </Button>
              <Button variant="outline" onClick={newRace}>
                New paragraph
              </Button>
            </div>
          </Card>
        )}

        {/* Informative & SEO Section */}
        <div className="mx-auto max-w-4xl mt-16 border-t border-border/40 pt-12 space-y-16">
          {/* Section 1: Intro */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Master the Type Racer Arena: Outrun Bots and Accelerate Your WPM
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Learning to type fast is a journey that moves from slow key recognition to fluid muscle automation. However, practicing in isolation can sometimes lead to stagnation. The <strong>Type Racer (Race Against Bots)</strong> game introduces a competitive edge to standard typing drills. By racing head-to-head against AI opponents in real time, you simulate the pressure of competitive environments, forcing your mind and hands to coordinate at their absolute limits.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              This interactive race board tracks your Words Per Minute (WPM), Characters Per Minute (CPM), and error counts live. As you speed through classic literary excerpts, quotes, and stories, you train your eyes to scan ahead and your fingers to execute precise keystroke sequences under stress. It is the perfect tool for competitive typists, students, and professionals aiming to break their typing speed plateaus.
            </p>
          </section>

          {/* Section 2: How to Play & Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">Rules of the Typing Race</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1. Countdown:</span> Click "Start Race" to trigger a 3-second countdown. Position your hands on the home row.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2. Race:</span> As the light hits zero, type the highlighted paragraph. The cars track your progress and WPM live.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3. Errors:</span> If you hit a wrong key, the text turns red. You must press Backspace and correct it to move forward.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4. Finish:</span> The first car to reach the checkered flag wins the race. Live accuracy and speed statistics are calculated.
                </li>
              </ul>
            </Card>

            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">Competitive Typing Benefits</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Under-Pressure Focus:</span> Racing against bots teaches you to ignore distractions and maintain rhythm when trailing behind.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Instant Error Correction:</span> Trains your reflexes to hit Backspace instantly when a mistake occurs, minimizing speed drops.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Visual Scanning:</span> Forces your eyes to scan 2-3 words ahead of your typing position to maintain fluid speed.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Diverse Vocabulary:</span> Exposes you to paragraphs from books, quotes, and stories to expand your muscle memory database.
                </li>
              </ul>
            </Card>
          </div>

          {/* Section 3: Deep Dive */}
          <Card className="border-border/60 bg-surface/10 p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight">The Psychology of Competitive Typing</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                In psychology, the phenomenon where individuals perform better on simple tasks when competing against others is known as <strong>Social Facilitation</strong>. When you practice typing by yourself, your focus can easily drift, and you may settle into a comfortable, sub-optimal pace. The presence of visual competitors—even simulated AI opponents—increases your physiological arousal, sharpening your visual focus and motor reflexes.
              </p>
              <p>
                However, competition also introduces the risk of "racing panic." When you see a bot's car pull ahead of you, your brain may try to force your fingers to move faster than your current muscle memory supports. This leads to typing mistakes, which require corrections and ultimately slow you down. The key to mastering Type Racer is maintaining **cognitive equilibrium**—the ability to recognize that an opponent is ahead while keeping your hands relaxed and focusing purely on the accuracy of your own inputs.
              </p>
              <p>
                WPM is calculated using a standard formula: <code>(Total Characters Typed / 5) / (Time Elapsed in Minutes)</code>. Because errors require you to press Backspace and retype the correct character, a single mistake effectively costs you three keystrokes (the wrong key, the backspace, and the correct key). Keeping your accuracy above 96% is scientifically proven to produce higher overall WPM scores than mashing keys at a frantic, error-prone pace.
              </p>
            </div>
          </Card>

          {/* Section 4: Tips */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-display text-xl font-bold">Advanced Strategies to Outrun Typing Bots</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Expand Your Lookahead
                </h4>
                <p className="text-sm text-muted-foreground">
                  Do not look at the character you are currently typing. Train your eyes to read one or two words ahead. This allows your brain to plan the motor sequences in advance, creating seamless transitions.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Master Home Row Discipline
                </h4>
                <p className="text-sm text-muted-foreground">
                  Keep your fingers resting lightly on the home row (ASDF JKL;). Letting your hands float too far from the home row introduces key alignment errors, especially under racing pressure.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Focus on Typing Rhythm
                </h4>
                <p className="text-sm text-muted-foreground">
                  Type with a steady, metronome-like beat. Rushing through easy words (like "the" or "and") only to pause on harder words breaks your momentum. A steady, consistent speed is always faster.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Leverage Wrist Ergonomics
                </h4>
                <p className="text-sm text-muted-foreground">
                  Keep your elbows at a 90-degree angle and your wrists elevated slightly above the keyboard. Letting your wrists rest on the desk or bend downwards slows finger movement and leads to fatigue.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: FAQs */}
          <section className="space-y-6 pb-12">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h3 className="font-display text-xl font-bold">Frequently Asked Questions</h3>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem
                value="faq-1"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  What is Type Racer (Race Bots) and how does it work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Type Racer is a competitive typing game where you race against AI opponents (bots) to finish typing a selected paragraph. The cars at the top of the screen move forward in real-time based on your active WPM compared to the speed of the bots. The first one to type the entire text correctly wins.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-2"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  How are the bots' speeds determined?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  The AI opponents are generated with random typing speeds ranging from 30 WPM to 80 WPM, representing typical average to advanced typist profiles. To make the race realistic, they have minor speed fluctuations (jitter) simulating natural typing pauses.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-3"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  What is considered a good typing speed (WPM) to win?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  An average typing speed is around 40 WPM. To consistently beat the AI opponents on this page, you should aim for a typing speed of 50 WPM to 60 WPM. Professional typists and programmers often maintain speeds between 70 WPM and 100+ WPM.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-4"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Should I focus on speed or accuracy first?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Always prioritize accuracy! Hitting a wrong key triggers a red block, and you cannot advance until you fix it. The time spent realizing a mistake, pressing backspace, and typing the right key ruins your speed far more than typing slightly slower but with 100% accuracy.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-5"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  How is WPM calculated in this game?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  WPM is calculated using a standard formula: <code>(Total Correct Characters / 5) / (Time Elapsed in Minutes)</code>. The division by 5 standardizes the measurement, as different words have different lengths (e.g. typing "a" vs "establishment").
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-6"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Can playing this game help me learn touch typing?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Yes, competitive gamification is highly effective for building muscle memory. Once you know the basic placement of keys, racing against bots pushes you to stop looking down at your fingers and instead rely entirely on physical touch and reflexes, which is the core of touch typing.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="border-border/60 bg-surface/40 p-3 backdrop-blur">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-2xl font-semibold tabular-nums">{value}</div>
    </Card>
  );
}
