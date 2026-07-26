import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { sfx } from "@/lib/sound";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Brain, Target, HelpCircle, Sparkles, BookOpen } from "lucide-react";

export const Route = createFileRoute("/games/spacebar")({
  head: () => ({
    meta: [
      { title: "Spacebar Speed Test — englishtypingtest.org" },
      {
        name: "description",
        content:
          "How fast can you mash the spacebar in 10 seconds? Instant hit-count with a saved personal best.",
      },
      { property: "og:title", content: "Spacebar Speed Test" },
      {
        property: "og:description",
        content: "Ten-second spacebar challenge with live hit counter and personal best tracking.",
      },
    ],
  }),
  component: SpacebarGame,
});

function SpacebarGame() {
  const DURATION = 10;
  const [hits, setHits] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const startedAt = useRef(0);
  const interval = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (!running && remaining === DURATION) {
        setRunning(true);
        setHits(1);
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
      if (running) {
        setHits((h) => h + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (interval.current) window.clearInterval(interval.current);
    };
  }, [running, remaining]);

  const sps = running || hits ? +(hits / DURATION).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold">Spacebar test</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Press the spacebar as fast as you can for {DURATION} seconds.
          </p>

          <Card className="mt-8 grid h-80 place-items-center border-border/60 bg-surface/40 text-center backdrop-blur">
            <div>
              <div className="font-display text-6xl font-bold text-gradient">{hits}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {running
                  ? `${remaining.toFixed(1)}s remaining`
                  : hits
                    ? `${sps} hits/s — press space to retry`
                    : "Press space to start"}
              </div>
            </div>
          </Card>
          <div className="mt-5 flex justify-center text-xs text-muted-foreground">
            <kbd className="rounded border border-border bg-surface px-2 py-1 font-mono">Space</kbd>
          </div>
        </div>

        {/* Informative & SEO Section */}
        <div className="mt-16 border-t border-border/40 pt-12 space-y-16">
          {/* Section 1: Intro */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Master the Spacebar Speed Test: Tapping Techniques and Keyboard Agility
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              The spacebar is the single largest, most frequently used key on any keyboard layout. In professional touch typing, spacing out words is often the hidden bottleneck that limits overall speed. In competitive gaming fields—ranging from Minecraft PvP and rhythm games like OSU! to speedrunning—spacebar clicking speed (or SPS - Spacebars Per Second) is a defining mechanic. The <strong>Spacebar Speed Test</strong> is designed to measure your raw speed, stamina, and finger tapping efficiency over a focused 10-second window.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              By practicing the spacebar drill, you train the flexor muscles of your thumbs and forearms, improving your tapping threshold and preventing muscular fatigue. Whether you are aiming to push past a typing plateu or optimize your input response in fast-paced games, mastering the physical ergonomics of spacebar tapping is a valuable skill.
            </p>
          </section>

          {/* Section 2: How to Play & Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">How to Take the Test</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1. Ready:</span> Keep your hand in a comfortable, relaxed position over the spacebar.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2. Start:</span> Press the Spacebar once. The timer will instantly start counting down from 10 seconds.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3. Mash:</span> Press the Spacebar as fast as you can. The live hits counter will track your score in real-time.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4. Score:</span> Once the timer hits zero, the test ends. Your final Hits/Second (SPS) will be displayed.
                </li>
              </ul>
            </Card>

            <Card className="border-border/60 bg-surface/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-semibold">Why Practice Spacebar Speed?</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Bypassing Bottlenecks:</span> Many typists write letters quickly but slow down between words. Improving thumb speed solves this.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Finger Stamina:</span> Develops strength and endurance in the thumb muscles, preventing cramps during long sessions.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Gaming Mechanics:</span> Boosts double-jumping, dashing, and rhythm synchronization in games.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">Switch Tactility:</span> Teaches you to feel the actuation and reset points of your keyboard switches.
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
              <h3 className="font-display text-xl font-bold tracking-tight">The Mechanics of High-Speed Tapping</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Spacebar speed tapping is a balance between muscular contraction and mechanical rebound. Unlike standard keys, the spacebar is wide and supported by stabilizers (metal bars under the keycap) to ensure it presses down evenly regardless of where you strike it. This makes it heavier and slower to return to its original position compared to smaller keys.
              </p>
              <p>
                To achieve extreme speeds, professional players utilize specific physical hand techniques:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Jitter mashing:</strong> Rapidly tensing the forearm muscles to produce a high-frequency vibration in the wrist, causing the thumb to bounce off the spacebar.</li>
                <li><strong>Butterfly tapping:</strong> Positioning the hand in a way that allows index and middle fingers to alternate strikes on the spacebar (useful on flat laptop boards).</li>
                <li><strong>Two-handed tapping:</strong> Using the index fingers of both hands to mash the key alternately, doubling the speed capability.</li>
              </ul>
              <p>
                Your choice of keyboard hardware is also a major factor. Mechanical keyboards with linear switches (such as Cherry MX Reds or optical switches) offer the lowest resistance and fastest rebound times. Membrane keyboards (found on office computers and standard laptops) can feel mushy and require more force to actuate, slowing down your SPS.
              </p>
            </div>
          </Card>

          {/* Section 4: Tips */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-display text-xl font-bold">Tips to Increase Your Spacebar Speed</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Relax Your Wrist
                </h4>
                <p className="text-sm text-muted-foreground">
                  Do not stiffen your hand entirely. A tense wrist absorbs the energy of your movements and tires you out within 5 seconds. Keep your wrist loose and elevated.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Alternate Thumbs
                </h4>
                <p className="text-sm text-muted-foreground">
                  In normal typing, most people only use one thumb. Practicing with both thumbs independently can build bilateral dexterity and balance your typing ergonomics.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Hover Close to the Key
                </h4>
                <p className="text-sm text-muted-foreground">
                  Do not raise your thumb too high between strikes. Keeping your thumb resting lightly on the surface of the keycap minimizes travel time and maximizes speed.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Practice in Short Bursts
                </h4>
                <p className="text-sm text-muted-foreground">
                  Mushing keys for minutes straight can lead to repetitive strain injury (RSI). Practice in 10-second bursts, followed by gentle hand and wrist stretches.
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
                  What is the Spacebar Test and how does it calculate SPS?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  The Spacebar Speed Test measures how many times you can press the spacebar key over a 10-second period. Your final score is calculated as Spacebars Per Second (SPS) by dividing your total registered hit count by the duration of the test (10 seconds).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-2"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  What is a good SPS score on the Spacebar Test?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  An average score for casual typing is around 5 to 6 SPS (50-60 clicks in 10 seconds). A good score is 7 to 8 SPS, which shows excellent finger agility. Scores above 9 to 10 SPS are exceptional, indicating the use of advanced clicking techniques like jitter clicking or mashing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-3"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Why is the spacebar so important for touch typing?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  In writing, the spacebar separates words. Because it is hit after almost every single word, a slow or lazy thumb movement can disrupt your typing rhythm, creating a micro-pause that lowers your overall WPM. Training your spacebar reflex ensures your spacing matches the speed of your letters.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-4"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Should I use my left or right thumb to hit the spacebar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Most right-handed people use their right thumb, and left-handed people use their left. However, ergonomic experts suggest training yourself to use the thumb opposite to the hand that typed the last letter of the word. For simplicity, sticking to one dominant thumb is common and perfectly fine.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-5"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  Can practicing this test improve my gaming performance?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  Yes! In games like Minecraft (for bridging or PvP), rhythm games, and platformers, the spacebar is mapped to critical movements like jumping or dodging. Improving your spacebar speed and actuation familiarity helps you execute precise, rapid maneuvers in game.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="faq-6"
                className="rounded-xl border border-border/60 bg-surface/30 px-5 glass transition-all duration-300 data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground py-4 hover:no-underline text-left">
                  What is the world record for spacebar mashing?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                  While unofficial, the world records for spacebar tapping speeds reach up to 14 to 17 SPS over a 10-second duration. This is achieved using specialized double-finger vibrating mashing techniques on high-end mechanical keyboards.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </main>
    </div>
  );
}
