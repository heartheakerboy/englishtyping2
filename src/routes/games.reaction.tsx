import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

export const Route = createFileRoute("/games/reaction")({
  head: () => ({
    meta: [
      { title: "Reaction Time Test — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Test your reflexes — click the instant the screen flips green. Five rounds, instant millisecond results.",
      },
      { property: "og:title", content: "Reaction Time Test" },
      {
        property: "og:description",
        content: "Measure your reflex speed in milliseconds across five rounds.",
      },
    ],
  }),
  component: ReactionGame,
});

type Phase = "idle" | "waiting" | "go" | "early" | "result";

function ReactionGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const startedAt = useRef<number>(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const start = () => {
    setPhase("waiting");
    const delay = 1200 + Math.random() * 2800;
    timer.current = window.setTimeout(() => {
      setPhase("go");
      startedAt.current = performance.now();
    }, delay);
  };

  const click = () => {
    if (phase === "waiting") {
      if (timer.current) window.clearTimeout(timer.current);
      sfx.fail();
      setPhase("early");
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - startedAt.current);
      sfx.tick();
      setTimes((t) => [...t, ms]);
      if (times.length + 1 >= 5) setPhase("result");
      else setPhase("idle");
    }
  };

  const reset = () => {
    setTimes([]);
    setPhase("idle");
  };

  const best = times.length ? Math.min(...times) : 0;
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold">Reaction time</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Click when the box turns. 5 rounds. Don't click early.
          </p>

          <Card
            onClick={phase === "idle" || phase === "early" || phase === "result" ? start : click}
            className={`mt-8 grid h-80 cursor-pointer place-items-center text-center transition-colors ${
              phase === "go"
                ? "bg-success/30 border-success/60"
                : phase === "waiting"
                  ? "bg-destructive/15 border-destructive/40"
                  : phase === "early"
                    ? "bg-destructive/30 border-destructive/60"
                    : "border-border/60 bg-surface/40"
            }`}
          >
            <div>
              <div className="font-display text-3xl font-semibold">
                {phase === "idle" && "Click to start"}
                {phase === "waiting" && "Wait for green…"}
                {phase === "go" && "CLICK!"}
                {phase === "early" && "Too early — click to retry"}
                {phase === "result" && "Done"}
              </div>
              {times.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Round {times.length + (phase === "result" ? 0 : 0)}/5 · last {times.at(-1)} ms
                </div>
              )}
            </div>
          </Card>

          {times.length > 0 && (
            <Card className="mt-6 border-border/60 bg-surface/40 p-5 backdrop-blur">
              <div className="flex flex-wrap gap-6 text-sm">
                <Stat label="Best" value={`${best} ms`} />
                <Stat label="Average" value={`${avg} ms`} />
                <Stat label="Attempts" value={times.length} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {times.map((t, i) => (
                  <span key={i} className="rounded-full bg-surface px-2 py-1 text-xs font-mono">
                    {t} ms
                  </span>
                ))}
              </div>
              {phase === "result" && (
                <Button
                  onClick={reset}
                  className="mt-4 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                >
                  Try again
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Informative & SEO Section */}
        <div className="mt-16 border-t border-border/40 pt-12 space-y-16">
          {/* Section 1: Intro */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Master the Reaction Time Test: Cognitive Reflexes and Typing Speed
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              In today's fast-paced digital environment, response speed defines how efficiently we interact with our technology. Whether you are typing a transcript, writing code, or gaming, your reaction time plays a central role. The <strong>Reaction Time Test</strong> is a simple yet powerful tool designed to measure your sensory-motor reflexes in milliseconds. By challenging yourself to react to instant changes, you gain direct insight into your brain's processing speed and neurological latency.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Typing speed (WPM) is heavily influenced by the micro-latency between reading a word and executing the physical key strikes. Minimizing this cognitive delay is what separates average typists from high-speed experts. This test allows you to measure, monitor, and train your reflex response times, giving you the edge in both competitive typing drills and professional productivity.
            </p>
          </section>

          {/* Section 2: How to Play & Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">How to Test Your Reflexes</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1. Start:</span> Click the box to begin. The board will turn red and read "Wait for green...".
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2. Focus:</span> The delay is random (1.2 to 4 seconds). Keep your eyes centered and finger ready.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3. Click:</span> The instant the box turns green, click as fast as you can. Clicking early causes a penalty.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4. Results:</span> Complete all 5 rounds to see your best time, worst time, and overall average speed.
                </li>
              </ul>
            </Card>

            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">Benefits of Reflex Training</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Keystroke Latency:</span> Trims down the tiny delay between your brain planning a keystroke and execution.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Visual Awareness:</span> Strengthens your visual lookahead, helping you read ahead without losing rhythm.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Gaming Advantage:</span> Direct carryover to high-precision action, rhythm, and competitive gaming.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Brain Health Monitor:</span> Use this to test for cognitive fatigue, sleep levels, and general focus status.
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
              <h3 className="font-display text-xl font-bold tracking-tight">The Science of Human Reflexes</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                From the moment the screen changes color to when your finger clicks the mouse, a complex sequence of biological signals takes place. First, the light hits your retina, where specialized cells convert light energy into electrical nerve impulses. The optic nerve transmits this signal to the visual cortex at the back of the brain. The brain processes the visual stimulus and commands the motor cortex to execute a click action, which sends electrical signals down the spinal cord to the muscles in your hand.
              </p>
              <p>
                This entire sequence happens in a fraction of a second. The average human reaction time to visual stimuli is roughly <strong>200 to 250 milliseconds (ms)</strong>. In contrast, reaction time to sound is faster, averaging about <strong>170 ms</strong>, because auditory pathways require fewer synapses to process.
              </p>
              <p>
                Several key factors influence your response time:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Fatigue:</strong> Sleep deprivation can slow your reaction time by 50ms or more, mimicking the effects of alcohol.</li>
                <li><strong>Distraction:</strong> Attempting to split your attention introduces cognitive bottlenecking, increasing latency.</li>
                <li><strong>Age:</strong> Reflexes typically peak in your late teens and early twenties, gradually slowing by 2-3ms per year thereafter.</li>
              </ul>
            </div>
          </Card>

          {/* Section 4: Tips */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-display text-xl font-bold">Expert Tips to Lower Your Milliseconds</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Focus on the Center
                </h4>
                <p className="text-sm text-muted-foreground">
                  Keep your eyes focused on the center of the box rather than scanning the edges. This activates your central vision, which has a higher density of photoreceptors.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Minimize Button Travel
                </h4>
                <p className="text-sm text-muted-foreground">
                  Rest your finger directly on the mouse button with zero space. Reduce the mechanical travel distance to as close to zero as possible.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Reduce Screen Glare
                </h4>
                <p className="text-sm text-muted-foreground">
                  Practice in a comfortably lit room. High contrast between your screen and background light makes it easier for your eyes to register the green flash.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Relieve Hand Tension
                </h4>
                <p className="text-sm text-muted-foreground">
                  Avoid tensing up your hand. A relaxed muscle reacts faster than a locked, rigid muscle. Keep your wrist loose and click in a fluid motion.
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
                  What is a normal reaction time score?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  The average human reaction time for a visual test is between 200ms and 270ms. Anything below 200ms is considered fast, and scores below 150ms are elite, typical of professional esports athletes and fighter pilots.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-2"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  How does reaction time affect my touch typing speed?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  In touch typing, you read words and convert them to finger movements. A fast reaction time trims down the "think-to-strike" latency on every individual letter. While muscle memory dictates where the keys are, reaction speed dictates how quickly you initiate the motion, helping you breach higher Words Per Minute (WPM) thresholds.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-3"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Can I train my brain to react faster?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Yes! Although genetic factors establish a base speed, regular practice of reaction games, touch typing, and fast-paced video games can shave 20ms to 50ms off your average score by optimizing your visual chunking and motor responses.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-4"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Why do I get a "Too early" error?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  The test uses a random delay between 1.2 and 4 seconds. If you click during this waiting period, the game registers an early click. This prevents players from guessing or timing the flash, ensuring the results reflect authentic neurological response speed.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-5"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Does my hardware impact my reaction time score?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Yes, hardware latency is a real factor. Standard monitors have a refresh delay, and standard mice have input lag. Using a high-refresh-rate gaming monitor (144Hz+) and a wired gaming mouse with optical switches can improve your test score by 10ms to 30ms compared to office equipment or wireless Bluetooth setups.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-6"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Are visual reactions faster than auditory reactions?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  No, auditory (hearing) reactions are actually faster. The brain's auditory pathway takes about 8-10 milliseconds to reach the cortex, while visual pathways take 20-40 milliseconds. This is why athletes start running at the sound of a starting gun rather than a flash of light.
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
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
