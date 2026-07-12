// Zombie Typing — defend the player.
// Zombies walk toward you across a horizontal lane.
// Type a zombie's word to vaporize it. If a zombie reaches you, HP drops.
// Every 5 waves a boss zombie spawns with a longer "boss" word.
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { GameShell, type GameStatus } from "@/components/games/GameShell";
import { StartPanel, type Difficulty } from "@/components/games/StartPanel";
import { GameOverPanel } from "@/components/games/GameOverPanel";
import { GameLeaderboard } from "@/components/games/GameLeaderboard";
import { useGameAudio } from "@/components/games/useGameAudio";
import { pickBossWord, pickWord } from "@/lib/game-words";
import { supabase } from "@/integrations/supabase/client";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skull, Shield, Trophy } from "lucide-react";
import zombieImg from "@/assets/games/zombie.png";
import zombieBossImg from "@/assets/games/zombie-boss.png";

export const Route = createFileRoute("/games/zombie-typing")({
  head: () => ({
    meta: [
      { title: "Zombie Typing — Survive the Horde" },
      {
        name: "description",
        content:
          "Type fast to vaporize zombies before they reach you. Bosses, combos and global leaderboards.",
      },
      { property: "og:title", content: "Zombie Typing" },
    ],
    links: [{ rel: "canonical", href: "/games/zombie-typing" }],
  }),
  component: ZombiePage,
});

const SLUG = "zombie-typing";
const FIELD_H = 520;
const ROW_HEIGHT = 88;
const ROWS = 4;

type Zombie = {
  id: number;
  text: string;
  row: number;
  x: number;
  speed: number;
  hp: number;
  boss: boolean;
};

function ZombiePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <Breadcrumbs />
        <h1 className="font-display text-3xl font-semibold md:text-4xl mt-4">Zombie Typing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Type words to vaporize the horde before they reach you.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Game />
          <GameLeaderboard slug={SLUG} />
        </div>

        {/* Informational Guide & FAQs */}
        <section className="mt-16 border-t border-border/40 pt-12 max-w-4xl space-y-12">
          {/* Guide content */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Zombie Typing: Survive the Horde with Tactical Speed</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              If standard practice drills feel uninspiring, <strong>Zombie Typing</strong> turns touch typing into an 
              action-oriented survival defense. Hordes of zombies crawl horizontally across four lanes toward your shield. 
              Each zombie carries a word that acts as its health bar; typing the spelling correctly and pressing Spacebar 
              vaporizes the target. This game forces you to develop rapid visual scanning, prioritize immediate threats, 
              and build key muscle memory under pressure.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              To evaluate your baseline typing speed before facing the undead, run a 
              <SmartLink href="/typing-test" className="text-primary hover:underline font-semibold font-display">free typing speed check</SmartLink> to 
              measure your baseline Words Per Minute (WPM) and accuracy.
            </p>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-rose-500">
                  <Skull className="h-5 w-5" />
                  Lane Prioritization & Multitasking
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Zombies spawn randomly across four tracks and walk at varying speeds. Rather than typing the first word you see, 
                  you must tactical-prioritize: check which zombie is closest to your defensive shield (on the left) and clear it 
                  first. Every 5 waves, a giant boss zombie spawns with a much longer, complex word, testing your accuracy limits.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-success">
                  <Shield className="h-5 w-5" />
                  Home Row Habits Prevent Panic
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  As the horde multiplies, panic typing causes errors, which halts your character and clears your score combo 
                  multiplier. The key to surviving is keeping your fingers resting on the Home Row (A, S, D, F for your left hand, 
                  and J, K, L, ; for your right). Let your fingers glide to the letters naturally without looking down.
                </p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              If you struggle with longer terms or boss words, step away from the survival lanes and practice row drills on the 
              <SmartLink href="/games/trainer" className="text-primary hover:underline font-semibold font-display">interactive keyboard trainer</SmartLink>, 
              or test your cognitive recall and typing endurance on the <SmartLink href="/games/memory" className="text-primary hover:underline font-semibold">visual recall memory drill</SmartLink>. 
              For raw reflex conditioning, try the <SmartLink href="/games/reaction" className="text-primary hover:underline">reflex reaction test</SmartLink> to 
              minimize response delay. You can also benchmark raw physical clicking speeds using the <SmartLink href="/games/cps" className="text-primary hover:underline">clicks per second test</SmartLink> and 
              the mashing-based <SmartLink href="/games/spacebar" className="text-primary hover:underline">spacebar speed check</SmartLink>.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              To check if your survival practice has increased your average word count, type a custom article and run your metrics 
              through our <SmartLink href="/calculators/wpm" className="text-primary hover:underline font-semibold">WPM converter tool</SmartLink> to 
              log your speed gains. Browse through other premium arcade games on our <SmartLink href="/games" className="text-primary hover:underline font-semibold">arcade typing games directory</SmartLink> to 
              find your next training challenge.
            </p>
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  How does Zombie Typing improve visual tracking?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Unlike top-down falling words, Zombie Typing features multiple parallel horizontal lanes. This forces your eyes to scan horizontally and make rapid priority decisions, which matches real-world typing and editing tasks.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  What happens when a zombie reaches the left side?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  When a zombie reaches the left edge, your player's shield HP drops. Standard zombies deal 14 HP damage, while giant boss zombies deal 35 HP damage. If your HP drops to 0, the game is over.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  Can I change my target word mid-typing?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Yes. If you start typing a word and decide a different zombie is a more immediate threat, just type the Spacebar to clear your current input buffer. This allows you to target another word immediately.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  How do difficulty levels affect the game?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Easy starts with 130 HP, slower zombies, and shorter words. Medium starts with 100 HP, and Hard drops your starting HP to 70 while significantly accelerating zombie walking speeds and spawning frequencies.
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
  const [hp, setHp] = useState(100);
  const [wave, setWave] = useState(1);
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const startedAt = useRef(0);
  const totals = useRef({ correct: 0, typed: 0, words: 0, killed: 0, bossKilled: 0 });
  const nextIdRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const lastFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const zRef = useRef<Zombie[]>([]);
  const hpRef = useRef(100);
  const waveRef = useRef(1);
  const statusRef = useRef<GameStatus>("idle");
  useEffect(() => {
    zRef.current = zombies;
  }, [zombies]);
  useEffect(() => {
    hpRef.current = hp;
  }, [hp]);
  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  const fieldWidth = () => containerRef.current?.clientWidth ?? 800;

  const reset = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setScore(0);
    setCombo(0);
    setWave(1);
    setHp(d === "easy" ? 130 : d === "hard" ? 70 : 100);
    setZombies([]);
    setInput("");
    totals.current = { correct: 0, typed: 0, words: 0, killed: 0, bossKilled: 0 };
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

      const fw = fieldWidth();
      const elapsed = (t - startedAt.current) / 1000;
      const w = 1 + Math.floor(elapsed / 22);
      if (w !== waveRef.current) {
        waveRef.current = w;
        setWave(w);
        // boss every 5 waves
        if (w % 5 === 0) {
          spawnZombie(true);
          audio.play("boss");
        } else {
          audio.play("level");
        }
      }

      // Spawn
      const spawnEvery = Math.max(
        550,
        1700 - (w - 1) * 110 - (difficulty === "hard" ? 250 : difficulty === "easy" ? -200 : 0),
      );
      if (t - lastSpawnRef.current > spawnEvery && zRef.current.length < 7) {
        lastSpawnRef.current = t;
        spawnZombie(false);
      }

      // Walk
      let hpLoss = 0;
      const next: Zombie[] = [];
      for (const z of zRef.current) {
        const nx = z.x - z.speed * dt;
        if (nx <= 84) {
          hpLoss += z.boss ? 35 : 14;
        } else {
          next.push({ ...z, x: nx });
        }
      }
      if (hpLoss > 0) {
        const newHp = Math.max(0, hpRef.current - hpLoss);
        hpRef.current = newHp;
        setHp(newHp);
        setCombo(0);
        audio.play("miss");
        if (newHp <= 0) {
          zRef.current = next;
          setZombies(next);
          endGame();
          return;
        }
      }
      zRef.current = next;
      setZombies(next);

      function spawnZombie(boss: boolean) {
        const text = boss
          ? pickBossWord()
          : pickWord(difficulty, w, new Set(zRef.current.map((x) => x.text)));
        const row = Math.floor(Math.random() * ROWS);
        const speed = boss
          ? 28 + w * 3
          : 36 +
            w * 5 +
            Math.random() * 12 +
            (difficulty === "hard" ? 14 : difficulty === "easy" ? -8 : 0);
        zRef.current = [
          ...zRef.current,
          { id: nextIdRef.current++, text, row, x: fw + 60, speed, hp: boss ? 1 : 1, boss },
        ];
      }

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
      const idx = zRef.current.findIndex((z) => z.text === guess);
      totals.current.typed += guess.length + 1;
      if (idx >= 0) {
        const killed = zRef.current[idx];
        zRef.current = zRef.current.filter((_, i) => i !== idx);
        setZombies(zRef.current);
        totals.current.correct += guess.length;
        totals.current.words += 1;
        totals.current.killed += 1;
        if (killed.boss) totals.current.bossKilled += 1;
        const newCombo = combo + 1;
        const gained = (killed.boss ? 150 : 15) + Math.floor(newCombo * 3);
        setScore((s) => s + gained);
        setCombo(newCombo);
        audio.play(killed.boss ? "boss" : "hit");
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
      metadata: { killed: totals.current.killed, bosses: totals.current.bossKilled },
    } as const;
  }, [status, score, wave, combo, difficulty]); // eslint-disable-line

  return (
    <GameShell
      title="Zombie Typing"
      status={status}
      score={score}
      combo={combo}
      level={wave}
      timeLeft={null}
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
          Type the closest zombie's word + <kbd className="rounded border px-1">Space</kbd> · Esc
          pauses
        </>
      }
    >
      <div
        ref={containerRef}
        className="relative h-[520px] w-full overflow-hidden bg-gradient-to-b from-emerald-950/40 via-background to-emerald-950/40"
      >
        {/* Ground rows */}
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-b border-emerald-500/10"
            style={{ top: 60 + i * ROW_HEIGHT, height: ROW_HEIGHT }}
          />
        ))}

        {/* HP bar */}
        <div className="absolute left-4 right-4 top-3 z-10">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>HP</span>
            <span>{Math.max(0, Math.round(hp))}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded bg-surface">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-[width]"
              style={{ width: `${Math.max(0, hp)}%` }}
            />
          </div>
        </div>

        {/* Player (left edge) */}
        <div className="pointer-events-none absolute bottom-6 left-3 z-10 grid h-16 w-16 place-items-center rounded-full border border-primary/40 bg-primary/10 text-2xl">
          🛡️
        </div>

        {/* Zombies */}
        {zombies.map((z) => {
          const matchLen = z.text.startsWith(partial) ? partial.length : 0;
          const top = 60 + z.row * ROW_HEIGHT + 8;
          return (
            <div
              key={z.id}
              style={{ transform: `translate3d(${z.x}px, ${top}px, 0)` }}
              className="absolute left-0 top-0 flex items-center gap-2"
            >
              <img
                src={z.boss ? zombieBossImg : zombieImg}
                alt=""
                className={
                  z.boss ? "h-20 w-20 drop-shadow-[0_0_18px_rgba(244,63,94,0.5)]" : "h-14 w-14"
                }
                draggable={false}
              />
              <div
                className={`rounded-md border px-2 py-1 font-mono text-sm shadow ${z.boss ? "border-rose-500/60 bg-rose-950/70 text-rose-50" : "border-border bg-surface/90"}`}
              >
                <span className="text-primary">{z.text.slice(0, matchLen)}</span>
                <span>{z.text.slice(matchLen)}</span>
              </div>
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
              placeholder="type + space"
              className="w-72 rounded-lg border border-border bg-background/90 px-4 py-2 text-center font-mono text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
        )}

        {status === "idle" && (
          <StartPanel
            title="Zombie Typing"
            subtitle="Vaporize zombies before they reach you. Bosses every 5 waves."
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
