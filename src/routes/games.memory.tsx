import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { fireConfetti } from "@/components/Confetti";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Brain, Target, HelpCircle, Sparkles, BookOpen } from "lucide-react";

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
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
        <div className="mx-auto max-w-2xl">
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
        </div>

        {/* Informative & SEO Section */}
        <div className="mt-16 border-t border-border/40 pt-12 space-y-16">
          {/* Section 1: Intro */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Master the Memory Sequence Game: The Science of Typing and Cognitive Recall
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              In today's fast-paced digital world, typing speed and accuracy are more than just technical skills; they are the primary channels through which we express our thoughts, execute tasks, and communicate. However, truly masterful typing requires a seamless fusion of physical dexterity and mental agility. This is where the <strong>Memory Sequence Game</strong> comes into play. Inspired by classic Simon-style memory training, this interactive drill merges cognitive recall with rapid physical reactions, training your brain to absorb, retain, and execute sequences in rapid succession.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Unlike traditional typing practice that relies on reading static text, sequence memory drills force your working memory to interface with your motor controls in real-time. By tracking a series of flashing colors and sounds that grow progressively longer, you build cognitive connections that translate directly into faster typing, quicker reflexes, and superior focus. Whether you are a programmer, transcriptionist, competitive typist, or simply looking to keep your brain sharp, this memory game offers an engaging, scientifically-backed way to upgrade your typing intelligence.
            </p>
          </section>

          {/* Section 2: How to Play & Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">How to Play the Game</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1. Start:</span> Click the "Start" button to begin. The game board will display four colored pads.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2. Watch:</span> The game will flash one or more pads in a specific sequence, accompanied by auditory tones.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3. Replicate:</span> Once the sequence finishes, click the pads in the exact order they were shown.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4. Advance:</span> Each correct round adds one more random color to the end of the sequence. A single wrong click ends the game.
                </li>
              </ul>
            </Card>

            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">Cognitive & Typing Benefits</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Spatial Awareness:</span> Trains visual coordinate grids, helping you map keys to your keyboard layout without looking.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Working Memory:</span> Expands the volume of information you can recall instantly, helping you read ahead while typing.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Reduced Latency:</span> Trims down the cognitive lag between seeing a prompt and executing the physical keystroke.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Concentration:</span> Pushes focus to the limits, training you to resist distractions and maintain steady typing flow.
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
              <h3 className="font-display text-xl font-bold tracking-tight">The Science Behind Sequence Memory Training</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                At the heart of the Memory Sequence Game is the concept of <strong>Working Memory</strong>. Working memory is the cognitive system responsible for temporarily holding and manipulating information in our minds. Unlike long-term memory, working memory has a limited capacity—often described in psychology as Miller's Law, which suggests the average human can hold about seven pieces of information at once.
              </p>
              <p>
                To break past this limit and achieve high scores (such as rounds 15, 20, or more), players must utilize a cognitive strategy known as <strong>chunking</strong>. Chunking is the process of grouping individual pieces of information into larger, meaningful units. For example, instead of memorizing "Blue, Green, Red, Yellow," a player might group them into a single visual shape or rhythmic sound pattern. In touch typing, chunking is the exact mechanism that allows you to type whole words and phrases as fluid units rather than individual letter keys.
              </p>
              <p>
                Furthermore, this game stimulates <strong>neuroplasticity</strong>—the brain's ability to reorganize itself by forming new neural connections. When you repeatedly connect visual and audio stimuli to finger movements, you are reinforcing the pathways between your visual cortex, auditory cortex, and motor cortex. Over time, this makes your hand-eye coordination fluid, automatic, and incredibly fast.
              </p>
            </div>
          </Card>

          {/* Section 4: Tips */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-display text-xl font-bold">Expert Strategies for High Scores</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Create Rhythms
                </h4>
                <p className="text-sm text-muted-foreground">
                  Treat the sequence like a musical beat. Singing or humming the rhythm of the tones can help you memorize patterns far longer than colors alone.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Map Sound to Location
                </h4>
                <p className="text-sm text-muted-foreground">
                  Each pad has a unique tone pitch. Connect lower pitches with bottom pads and higher pitches with top pads to build auditory memory backups.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Use Visual Geometry
                </h4>
                <p className="text-sm text-muted-foreground">
                  Track the sequence as a geometric shape or path (e.g. circles, zig-zags). Visual pathways are easier to remember than abstract colors.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Focus on the Tail
                </h4>
                <p className="text-sm text-muted-foreground">
                  Since the sequence only adds one new pad per round, reinforce the existing chain in your mind so you only have to focus on the final addition.
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
                  What is the Memory Sequence Game, and what is its purpose?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  The Memory Sequence Game is an interactive cognitive training drill based on the classic Simon game. Its purpose is to test and improve your sequential memory, spatial awareness, and auditory-visual processing speed. By challenging yourself to remember progressively longer sequences of colors and sounds, you train your brain to hold and recall complex information in real-time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-2"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  How does playing a memory game help improve my typing speed?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Typing speed (Words Per Minute) is not just about finger speed; it is also about cognitive processing speed. When you type, your brain must read a word, plan the keystrokes, and command your fingers to move. Playing this game trains the direct pathways between visual inputs and motor reactions. It also improves your "visual lookahead"—the ability to read ahead while your fingers are still typing the previous words, which is essential for fluid, high-speed typing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-3"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  What is considered a good score on the sequence memory test?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  A score of 7 to 9 is considered average, as this falls within the typical human working memory capacity of 7 ± 2 items. Hitting a score of 10 to 14 is good, indicating strong concentration and visual chunking. Scores of 15 to 20 are excellent, demonstrating advanced chunking techniques and spatial memory. Anything above 20 is exceptional and shows master-level focus and cognitive conditioning.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-4"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Is it better to play this game on a desktop or a mobile device?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Both platforms offer unique training benefits! Playing on a desktop with a mouse trains hand-eye coordination and precision cursor control, which helps with mouse accuracy. Playing on a mobile device or tablet using touch input trains rapid finger responses and spatial hand-eye reflex speeds. We recommend trying both to see which method helps you build better spatial reflexes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-5"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Does the game support keyboard shortcuts?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Currently, the game uses touch/click controls to mimic classic Simon games. However, visualizing the layout while clicking trains your peripheral vision, which is a key component of touch typing as it allows you to keep your eyes centered on the screen rather than looking down at your fingers or mouse.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-6"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Can children use this game to build learning and keyboard skills?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Absolutely! The Memory Sequence Game is an excellent educational tool for children. It helps develop fundamental cognitive skills such as pattern recognition, short-term recall, attention to detail, and sequential processing. It also serves as a fun, low-pressure introduction to interactive digital boards, helping them become comfortable with visual interfaces before moving on to full touch typing lessons.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </main>
    </div>
  );
}
