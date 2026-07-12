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

export const Route = createFileRoute("/games/cps")({
  head: () => ({
    meta: [
      { title: "Clicks Per Second Test — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Find your CPS — how many clicks per second can you land? Five-second sprint with a personal best tracker.",
      },
      { property: "og:title", content: "CPS Test — Clicks Per Second" },
      {
        property: "og:description",
        content:
          "Time-boxed click sprint that measures your clicks per second and saves your best score.",
      },
    ],
  }),
  component: CpsGame,
});

function CpsGame() {
  const DURATION = 5;
  const [clicks, setClicks] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const [best, setBest] = useState(0);
  const interval = useRef<number | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    const b = Number(localStorage.getItem("ett-cps-best") || 0);
    if (b) setBest(b);
  }, []);
  useEffect(
    () => () => {
      if (interval.current) window.clearInterval(interval.current);
    },
    [],
  );

  const click = () => {
    if (!running) {
      setRunning(true);
      setClicks(1);
      setRemaining(DURATION);
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
    if (remaining <= 0) return;
    setClicks((c) => c + 1);
  };

  const cps = running || clicks ? +(clicks / DURATION).toFixed(2) : 0;
  useEffect(() => {
    if (!running && cps > best) {
      setBest(cps);
      localStorage.setItem("ett-cps-best", String(cps));
    }
  }, [running, cps, best]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold">Clicks per second</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Click as fast as possible for {DURATION} seconds.
          </p>

          <Card
            onClick={click}
            className="mt-8 grid h-80 cursor-pointer select-none place-items-center border-border/60 bg-surface/40 text-center backdrop-blur transition-transform active:scale-[0.99]"
          >
            <div>
              <div className="font-display text-6xl font-bold text-gradient">{clicks}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {running
                  ? `${remaining.toFixed(1)}s remaining`
                  : clicks
                    ? `${cps} CPS · click to retry`
                    : "Click to start"}
              </div>
            </div>
          </Card>

          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <Stat label="CPS" value={cps} />
            <Stat label="Best CPS" value={best || "—"} />
            <Stat label="Total clicks" value={clicks} />
          </div>
          {clicks > 0 && !running && (
            <Button
              onClick={() => {
                setClicks(0);
                setRemaining(DURATION);
              }}
              variant="outline"
              className="mt-5"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Informative & SEO Section */}
        <div className="mt-16 border-t border-border/40 pt-12 space-y-16">
          {/* Section 1: Intro */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Master the CPS Test: Clicks Per Second Speed & Stamina Guide
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Clicks Per Second (CPS) is a standard metric used to measure finger speed, physical dexterity, and clicking responsiveness. Primarily popularized in competitive gaming—specifically Minecraft PvP, rhythm games, and clicker games—your CPS determines how quickly you can trigger inputs, placing you at a distinct advantage during fast-paced encounters. The <strong>CPS Test</strong> measures your clicking rate over a focused 5-second sprint, challenging your muscles to operate at peak frequencies.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Beyond gaming, a high click frequency reflects strong neural conductivity and motor control. Working on your click reflex trains the muscles in your hand, fingers, and forearm to react quickly, building muscle stamina and reducing input lag. Whether you are benchmarking a new gaming mouse or training for competitive gaming, improving your CPS requires physical control and understanding clicking techniques.
            </p>
          </section>

          {/* Section 2: How to Play & Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">How to Test Your CPS</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1. Start:</span> Click the box to begin. The first click registers and starts the 5-second timer.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2. Sprint:</span> Press the mouse button as fast as you can. The box tracks every click in real-time.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3. Finish:</span> Once the countdown hits 0s, the timer stops, and a finish tone plays.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4. Results:</span> View your final CPS and total clicks. Your best score is automatically saved to local storage.
                </li>
              </ul>
            </Card>

            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">Benefits of Click Training</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Finger Agility:</span> Develops fine motor control, allowing your fingers to move independently and rapidly.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Muscle Endurance:</span> Builds up fatigue resistance in the hand muscles during long work or gaming sessions.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Hardware Familiarity:</span> Helps you identify the tension, actuation force, and bounce of your mouse switch.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Reaction Carryover:</span> Enhances the neural pathways between sight and immediate physical response.
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
              <h3 className="font-display text-xl font-bold tracking-tight">Advanced Clicking Methodologies</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                To exceed standard clicking speeds (which sit around 5 to 6 CPS), competitive players develop specific physical clicking techniques to bypass the biological limitations of standard muscle contraction:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Jitter Clicking:</strong> Involves tensing the wrist and forearm muscles to create a rapid vibration, which is transferred to the index finger, clicking the mouse. This technique can achieve speeds of 10 to 14 CPS.</li>
                <li><strong>Butterfly Clicking:</strong> Alternate-tapping the mouse button with the index and middle fingers. By rocking the fingers back and forth, you double your input frequency, pushing speeds of 12 to 18 CPS.</li>
                <li><strong>Drag Clicking:</strong> Dragging a slightly frictioned finger across the mouse button. The friction causes the plastic to bounce rapidly, registering up to 25+ CPS (requires a mouse with low debounce delay).</li>
              </ul>
              <p className="text-destructive font-semibold">
                Important Ergonomic Warning: Extended jitter clicking or mashing can cause strain on your tendons and joints, potentially leading to Repetitive Strain Injury (RSI) or Carpal Tunnel Syndrome. Always warm up your hands, avoid forcing excessive tension, and take frequent breaks.
              </p>
            </div>
          </Card>

          {/* Section 4: Tips */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-display text-xl font-bold">Expert Tips to Boost Your CPS</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Choose the Right Mouse
                </h4>
                <p className="text-sm text-muted-foreground">
                  Gaming mice with optical switches actuate faster and have less delay than standard office mice. Look for models that allow you to adjust debounce times.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Keep Your Hand Relaxed
                </h4>
                <p className="text-sm text-muted-foreground">
                  Do not squeeze your mouse tightly. A light grip allows your fingers to move with greater speed and agility, minimizing long-term fatigue.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Position Your Fingers
                </h4>
                <p className="text-sm text-muted-foreground">
                  For butterfly clicking, arch your knuckles slightly to give your fingers space to move. Position them near the front edge of the mouse button for maximum leverage.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Set Up a Stable Base
                </h4>
                <p className="text-sm text-muted-foreground">
                  Keep your elbow resting comfortably on your desk or armrest. A stable arm base reduces erratic movement and provides support for your wrist.
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
                  What is a good CPS score on the test?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  A score of 4 to 6 CPS is average and represents standard index-finger clicking. Hitting 7 to 9 CPS is good and shows strong clicking control. Scores of 10 to 14 CPS are excellent, usually achieved using jitter or butterfly clicking. Anything above 15 CPS is elite and requires specialized drag clicking or double-clicking mice.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-2"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  How is Clicks Per Second calculated?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  CPS is calculated by dividing your total registered click count by the duration of the test. In this test, it is: <code>Total Clicks / 5 Seconds</code>. This gives you your average clicking frequency per second.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-3"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Can clicking tests damage my gaming mouse?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Quality gaming mice are rated for 20 to 80 million clicks. While practicing won't break your mouse instantly, techniques like drag clicking or heavy mashing apply more friction and impact force to the switches, which can shorten the switch lifecycle over time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-4"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  What is the difference between jitter clicking and butterfly clicking?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Jitter clicking relies on tensing your arm muscles to shake your index finger on a single mouse button. Butterfly clicking uses two fingers (index and middle) to alternate tapping the button. Jitter clicking is single-finger and can be harder to aim with, whereas butterfly clicking is smoother and typically achieves higher CPS.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-5"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Can I improve my CPS without getting tired?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Yes, focus on hand relaxation and leverage. Keep your fingers close to the key, use a mouse with light switches, and practice in short intervals. With muscle conditioning, your hand will adapt, reducing fatigue.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-6"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  What is the world record for CPS?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  In a 5-second test, the world records for raw clicking exceed 20 to 22 CPS, achieved using advanced drag clicking techniques on specialized double-clicking gaming mice.
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
