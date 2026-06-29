import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Keyboard, Hand, Target, Timer, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Touch Typing Guide & Lessons — English Typing Test" },
      {
        name: "description",
        content:
          "Learn touch typing the right way. Proper finger placement, home-row drills and progressive lessons to type faster with fewer mistakes.",
      },
      { property: "og:title", content: "Touch Typing Guide & Lessons" },
      {
        property: "og:description",
        content:
          "Step-by-step touch typing lessons: finger placement, home row, top and bottom row drills, and speed-building practice.",
      },
      { property: "og:url", content: "/lessons" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "/lessons" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Touch Typing Guide & Lessons",
          description:
            "Proper finger placement and progressive drills to learn touch typing and improve WPM.",
          url: "/lessons",
        }),
      },
    ],
  }),
  component: LessonsPage,
});

const LESSONS = [
  {
    n: 1,
    title: "Home Row Mastery",
    keys: "a s d f  j k l ;",
    desc: "Anchor your fingers and build the foundation for every keystroke that follows.",
  },
  {
    n: 2,
    title: "Top Row Reach",
    keys: "q w e r  u i o p",
    desc: "Train each finger to leave home and return without looking down.",
  },
  {
    n: 3,
    title: "Bottom Row Reach",
    keys: "z x c v  n m , .",
    desc: "Master the awkward downward stretches that limit most typists.",
  },
  {
    n: 4,
    title: "Numbers & Symbols",
    keys: "1 2 3 …  ! @ # …",
    desc: "Cover the number row and the most common symbols used in everyday writing.",
  },
  {
    n: 5,
    title: "Speed & Rhythm",
    keys: "common words",
    desc: "Type real sentences at a steady cadence — speed comes from rhythm, not effort.",
  },
  {
    n: 6,
    title: "Accuracy Drills",
    keys: "tricky bigrams",
    desc: "Hunt down your weakest letter pairs and turn them into your strongest.",
  },
];

function LessonsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <header className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-muted-foreground">
            <Keyboard className="h-3 w-3 text-primary" /> Touch Typing Guide
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Learn to type faster — the right way
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Touch typing is the skill of typing without looking at the keyboard. With the right
            finger placement and a few weeks of consistent practice, most people double their
            words-per-minute and cut their mistakes in half.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="bg-gradient-primary text-primary-foreground">
              <Link to="/test">
                Start a typing test <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/games/trainer">Open keyboard trainer</Link>
            </Button>
          </div>
        </header>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <Hand className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-display text-lg font-semibold">Finger placement</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Index fingers rest on <kbd className="rounded bg-surface px-1">F</kbd> and{" "}
              <kbd className="rounded bg-surface px-1">J</kbd> (feel for the bumps). The other
              fingers fall naturally onto the home row. Thumbs hover over the spacebar.
            </p>
          </Card>
          <Card className="p-5">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-display text-lg font-semibold">Accuracy first</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Slow down until you're hitting 97%+ accuracy. Speed without accuracy is just fast
              typos — and you'll un-learn good habits to chase the WPM number.
            </p>
          </Card>
          <Card className="p-5">
            <Timer className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-display text-lg font-semibold">Short daily sessions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fifteen focused minutes a day beats one long Sunday session. Muscle memory builds
              through repetition, not duration.
            </p>
          </Card>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">The 6-lesson plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Work through each lesson until you hit 95% accuracy at a comfortable speed before moving
            on.
          </p>
          <ol className="mt-6 space-y-3">
            {LESSONS.map((l) => (
              <li key={l.n}>
                <Card className="flex items-start gap-4 p-5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-primary/15 font-display text-primary">
                    {l.n}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold">{l.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
                    <code className="mt-2 inline-block rounded bg-surface px-2 py-1 text-xs text-muted-foreground">
                      {l.keys}
                    </code>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-surface/40 p-6 text-center">
          <h2 className="font-display text-xl font-semibold">
            How to type faster — the short version
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Keep your wrists straight and floating, look at the screen (not the keys), maintain a
            steady rhythm, and take a short typing test every day. Speed is a side-effect of
            consistent, accurate practice.
          </p>
          <Button asChild className="mt-4 bg-gradient-primary text-primary-foreground">
            <Link to="/test">Take a 1-minute test now</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
