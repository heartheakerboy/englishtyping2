import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Brain, Target, HelpCircle, Sparkles, BookOpen } from "lucide-react";

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

        {/* Informative & SEO Section */}
        <div className="mt-16 border-t border-border/40 pt-12 space-y-16">
          {/* Section 1: Intro */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Master the Keyboard Trainer: Build Touch Typing Muscle Memory
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Mastering touch typing—the ability to write without looking down at your hands—is one of the most valuable digital skills you can acquire. The journey to high-speed typing begins by breaking down the keyboard layout into row-by-row coordinate zones. The <strong>Keyboard Trainer</strong> is designed as a focused drill system, letting you practice specific groups of keys (Home Row, Top Row, Bottom Row, and Numbers) in isolation to establish precise, unconscious muscle memory.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Instead of typing complex sentences where your hands must jump erratic distances, this trainer streams row-specific characters. By drilling these keys repeatedly at speed, your brain develops a physical map of the keyboard, reducing input hesitation, increasing Words Per Minute (WPM), and sharpening keystroke accuracy.
            </p>
          </section>

          {/* Section 2: How to Play & Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">How to Use the Trainer</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1. Choose a Row:</span> Select a key group (Home Row, Top Row, Bottom Row, or Numbers) from the top buttons.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2. Position Hands:</span> Place your fingers on the home row keys (ASDF for left hand, JKL; for right hand).
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3. Type:</span> Type the letters on screen. Correct inputs turn green; errors turn red and underline.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4. Track:</span> Look at the live stats to monitor your WPM, accuracy, and elapsed time. Click "Restart" to try a new stream.
                </li>
              </ul>
            </Card>

            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">Row Drill Benefits</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Subconscious Mapping:</span> Establishes direct neural pathways between the visual representation of a letter and the physical movement.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Reach Coordination:</span> Teaches fingers how to stretch upward (Top row) and curl downward (Bottom row) from a home row anchor.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Number Row Control:</span> Reduces the temptation to look down when entering data or special symbols.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Error Isolation:</span> Lets you focus on rows that cause you the most mistakes, addressing typing weaknesses.
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
              <h3 className="font-display text-xl font-bold tracking-tight">The Anatomy of Touch Typing Rows</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Each row on a QWERTY keyboard serves a specific role in typing ergonomics and requires distinct finger movements:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Home Row (ASDF JKL;):</strong> The home base. Your thumbs rest on the spacebar, and your fingers rest on these keys. Every keystroke starts from here, and your fingers must immediately return here after typing a key on other rows.</li>
                <li><strong>Top Row (QWERTY UIOP):</strong> Requires fingers to extend upward and slightly left. This is usually the easiest row to learn after the home row because reaching upward feels natural for most hands.</li>
                <li><strong>Bottom Row (ZXCVBNM ,.):</strong> Requires fingers to curl downward and right. This row is widely considered the hardest to master without looking, as curling the fingers down requires fine motor control and spatial precision.</li>
                <li><strong>Number Row (12345 67890):</strong> The longest reach, requiring fingers to stretch two rows upward. Drilling this row is essential for coding and spreadsheet management.</li>
              </ul>
              <p>
                By practicing these rows in isolation, you create a <strong>sensory integration pathway</strong>. When your eyes see a letter, the brain automatically converts that image into a finger movement script, bypassing the conscious thought process of locating the key.
              </p>
            </div>
          </Card>

          {/* Section 4: Tips */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-display text-xl font-bold">Expert Tips to Build Key Muscle Memory</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Keep Your Eyes on the Screen
                </h4>
                <p className="text-sm text-muted-foreground">
                  Never look down at your keyboard. If you make a mistake, feel your way back to the home row bumps (usually on the F and J keys) and continue.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Return to the Home Row
                </h4>
                <p className="text-sm text-muted-foreground">
                  Train your fingers to immediately snap back to their home row positions after striking a key on the top, bottom, or number rows.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Curve Your Fingers
                </h4>
                <p className="text-sm text-muted-foreground">
                  Keep your fingers curved like you are holding a tennis ball. Typing with flat fingers slows response speed and makes reaching other rows difficult.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Focus on Accuracy Over Speed
                </h4>
                <p className="text-sm text-muted-foreground">
                  Speed comes as a natural byproduct of accuracy. If you try to type faster than your fingers can accurately move, you will build bad muscle habits.
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
                  What is the purpose of a keyboard row trainer?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  The purpose is to build layout muscle memory by drilling specific rows in isolation. By removing the complexity of shifting between multiple rows, you can focus on mastering individual finger extensions and positions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-2"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Why is the home row considered the most important row?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  The home row is your hand's reference point. The index fingers rest on F and J (which have physical bumps), allowing you to align your hands without looking. Every key strike begins from the home row, and fingers return to the home row after typing to maintain coordinate alignment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-3"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  How long should I practice row drills every day?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Short, consistent sessions are highly effective. Practicing for 10 to 15 minutes a day is better than a single long session per week. This reinforces daily muscle consolidation and prevents fatigue.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-4"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Why is the bottom row harder to type than the top row?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Reaching upward to the top row naturally coordinates with how our fingers extend. Reaching downward to the bottom row requires you to curl your fingers underneath your hand, which can feel cramped and requires more visual-motor control to execute without hitting other keys.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-5"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Should I look at the keyboard while practicing these drills?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  No, you should never look at the keyboard. If you look down, you are relying on visual memory rather than muscle memory. Keep your eyes on the screen, feel the F and J bumps, and let your hands learn the tactile distances.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-6"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  How do I transition from this trainer to writing full words?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Once your accuracy on each row exceeds 95% at comfortable speeds, you can transition to typing short words and then full sentences. The muscle memory built in the trainer will make word coordinates feel familiar and natural.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </main>
    </div>
  );
}
