import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Calculator, Clock, CheckCircle2, RotateCcw, Activity, ShieldAlert, BookOpen } from "lucide-react";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Typing Test Methodology & Scoring Formulas — EnglishTypingTest.org" },
      {
        name: "description",
        content:
          "Official mathematical formulas and testing methodology for EnglishTypingTest.org: Gross WPM, Net WPM, Accuracy, CPM, Consistency, timing precision, and error handling.",
      },
      { property: "og:title", content: "Typing Test Methodology & Scoring Formulas" },
      {
        property: "og:description",
        content:
          "Official mathematical formulas and testing methodology for EnglishTypingTest.org: Gross WPM, Net WPM, Accuracy, CPM, Consistency, timing precision, and error handling.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/methodology" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/methodology" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Typing Speed Measurement Methodology and Mathematical Implementation",
          url: "https://www.englishtypingtest.org/methodology",
          description:
            "Exhaustive documentation of Gross WPM, Net WPM, CPM, Accuracy, and Consistency calculation algorithms used on EnglishTypingTest.org.",
          author: {
            "@type": "Organization",
            name: "English Typing Test Engineering Team",
            url: "https://www.englishtypingtest.org/",
          },
          publisher: {
            "@type": "Organization",
            name: "English Typing Test",
            url: "https://www.englishtypingtest.org/",
          },
        }),
      },
    ],
  }),
  component: MethodologyPage,
});

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Measurement Standard &amp; Engineering Specifications
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Measurement Methodology &amp; Mathematical Formulas
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            A comprehensive, transparent guide to how EnglishTypingTest.org counts characters, calculates speed and
            accuracy, manages timers, and processes typing mistakes.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Published: February 2026</span>
            <span>•</span>
            <span>Last Audited &amp; Verified: September 2026</span>
            <span>•</span>
            <span>Engine Reference: <code className="text-primary font-mono">src/lib/typing-engine.ts</code></span>
          </div>
        </div>

        <div className="mt-10 space-y-12 leading-relaxed text-muted-foreground text-base">
          {/* Section 1: Standard Word Definition */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              1. The Universal Standard Word Length
            </h2>
            <p>
              In natural human language, word length varies wildly—from 1-letter words like "a" to 14-letter words
              like "characteristic". If typing speed were calculated simply by counting blank spaces between words,
              a typist given a sentence of short words would artificially appear twice as fast as a typist given a
              sentence of long academic vocabulary.
            </p>
            <p>
              To ensure objective fairness and exam standard comparability, EnglishTypingTest.org enforces the
              internationally accepted typographic standard:
            </p>
            <div className="rounded-lg border border-border/80 bg-surface/30 p-4 font-mono text-center text-sm text-foreground">
              1 Standardized Typographic Word = Exactly 5 Characters (Keystrokes)
            </div>
            <p className="text-sm">
              All printable characters count toward this metric, including alphabet letters, numbers, spaces, and
              punctuation symbols.
            </p>
          </section>

          {/* Section 2: Mathematical Formulas */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              2. Core Mathematical Formulas
            </h2>

            <div className="grid gap-6">
              {/* Gross WPM */}
              <Card className="p-6 border-border/60 bg-surface/20">
                <h3 className="text-lg font-bold text-foreground">Gross (Raw) Words Per Minute</h3>
                <p className="text-sm mt-1">
                  Gross WPM measures pure mechanical keyboard velocity, counting every character typed regardless of
                  whether it was correct or mistyped.
                </p>
                <div className="mt-3 rounded-md bg-background/80 p-3 font-mono text-sm text-primary">
                  Gross WPM = (Total Typed Characters ÷ 5) ÷ Elapsed Minutes
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Code: <code className="font-mono">rawWpm = (typed.length / 5) / (elapsedSeconds / 60)</code>, rounded
                  to nearest integer.
                </p>
              </Card>

              {/* Net WPM */}
              <Card className="p-6 border-border/60 bg-surface/20">
                <h3 className="text-lg font-bold text-foreground">Net Words Per Minute (Net WPM)</h3>
                <p className="text-sm mt-1">
                  Net WPM is the primary benchmark of typing proficiency. On EnglishTypingTest.org, Net WPM is derived
                  strictly from correctly typed characters matching the target text.
                </p>
                <div className="mt-3 rounded-md bg-background/80 p-3 font-mono text-sm text-primary">
                  Net WPM = (Correct Characters ÷ 5) ÷ Elapsed Minutes
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Code: <code className="font-mono">wpm = (correctChars / 5) / (elapsedSeconds / 60)</code>, rounded to
                  nearest integer.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <em>Note on Mistake Impact:</em> While our engine does not apply an arbitrary extra penalty subtraction,
                  mistyped characters do not contribute to the numerator. Furthermore, backspacing errors consumes
                  elapsed time, naturally reflecting the real-world productivity penalty of mistakes.
                </p>
              </Card>

              {/* Accuracy */}
              <Card className="p-6 border-border/60 bg-surface/20">
                <h3 className="text-lg font-bold text-foreground">Keystroke Accuracy</h3>
                <p className="text-sm mt-1">
                  Accuracy represents the precision of your input relative to total characters submitted:
                </p>
                <div className="mt-3 rounded-md bg-background/80 p-3 font-mono text-sm text-primary">
                  Accuracy = (Correct Characters ÷ Total Typed Characters) × 100%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Code: <code className="font-mono">Math.round((correctChars / typed.length) * 1000) / 10</code>.
                  Displayed rounded to 1 decimal place (e.g. 98.4%). If no characters have been typed yet, accuracy
                  defaults safely to 100.0%.
                </p>
              </Card>

              {/* CPM */}
              <Card className="p-6 border-border/60 bg-surface/20">
                <h3 className="text-lg font-bold text-foreground">Characters Per Minute (CPM)</h3>
                <p className="text-sm mt-1">
                  CPM measures the total number of correct characters typed per minute. In international examination
                  systems and Asian/European keyboard tests, CPM is widely used alongside WPM.
                </p>
                <div className="mt-3 rounded-md bg-background/80 p-3 font-mono text-sm text-primary">
                  CPM = Correct Characters ÷ Elapsed Minutes = Net WPM × 5
                </div>
              </Card>

              {/* Consistency */}
              <Card className="p-6 border-border/60 bg-surface/20">
                <h3 className="text-lg font-bold text-foreground">Typing Consistency Percentage</h3>
                <p className="text-sm mt-1">
                  Consistency measures how evenly you type without stopping or stuttering. We sample typing speed in
                  1-second intervals throughout the test and calculate the standard deviation (σ) and coefficient of
                  variation (CV):
                </p>
                <div className="mt-3 rounded-md bg-background/80 p-3 font-mono text-sm text-primary">
                  CV = Standard Deviation (σ) ÷ Mean WPM (x̄)
                  <br />
                  Consistency = max(0, min(100, round((1 - CV) × 100)))
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  A typist with 85%+ consistency maintains a rhythmic, fluid cadence, which is the primary hallmark of
                  master touch typists.
                </p>
              </Card>
            </div>
          </section>

          {/* Section 3: Timing & Clock Mechanics */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              3. Clock Precision &amp; Timing Architecture
            </h2>
            <p>
              Many browser typing tests use simple JavaScript <code className="text-xs bg-surface/50 px-1 py-0.5 rounded">setInterval(..., 1000)</code> loops.
              In modern web browsers, if a tab becomes inactive or the main thread pauses for garbage collection, interval
              timers drift significantly, resulting in invalid speed scores.
            </p>
            <p>
              EnglishTypingTest.org utilizes high-precision monotonic clock deltas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Timestamp Difference:</strong> On the very first keystroke, a timestamp is recorded (<code className="font-mono text-xs">startedAt = Date.now()</code>).
                All subsequent calculations measure true wall-clock elapsed milliseconds (<code className="font-mono text-xs">(Date.now() - startedAt) / 1000</code>).
              </li>
              <li>
                <strong>Locked Denominator in Timed Modes:</strong> In fixed time modes (e.g. 60 seconds), the final
                test duration passed to the result generator is locked to exactly the configured duration (e.g. 60.00s),
                eliminating fractional animation delays from skewing the final result.
              </li>
              <li>
                <strong>Minimum Time Threshold:</strong> During the first 500 milliseconds, elapsed time is bounded to a
                minimum of 0.5s to prevent division-by-zero anomalies when the first key is registered.
              </li>
            </ul>
          </section>

          {/* Section 4: Error Handling & Backspace */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="h-6 w-6 text-primary" />
              4. Error Evaluation &amp; Backspace Behavior
            </h2>
            <p>
              Characters are evaluated in linear character order:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Correct Keystroke:</strong> When <code className="font-mono text-xs">typed[i] === target[i]</code>,
                the character turns green and increments correct character counts.
              </li>
              <li>
                <strong>Incorrect Keystroke:</strong> When <code className="font-mono text-xs">typed[i] !== target[i]</code>,
                the character is underlined in red.
              </li>
              <li>
                <strong>Backspace Correction:</strong> Users can press Backspace at any point to delete incorrect
                characters and retype them accurately. Retyped characters immediately count as correct once corrected.
              </li>
              <li>
                <strong>Whitespace &amp; Spacebar:</strong> Spaces are treated as mandatory characters. Omitting a space
                shifts subsequent characters out of alignment until corrected.
              </li>
            </ul>
          </section>

          {/* Section 5: Arcade Game Mechanics */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              5. Arcade Game Measurement Protocols
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5 border-border/60 bg-surface/20">
                <h3 className="font-semibold text-foreground mb-1">Clicks Per Second (CPS)</h3>
                <p className="text-sm">
                  Calculated as <code className="font-mono text-xs">Total Registered Clicks ÷ Elapsed Seconds</code> over a
                  strict 5-second sprint. Initiated on the first registered mouse click.
                </p>
              </Card>

              <Card className="p-5 border-border/60 bg-surface/20">
                <h3 className="font-semibold text-foreground mb-1">Visual Reaction Time</h3>
                <p className="text-sm">
                  Measures simple visual reaction latency in milliseconds from the exact instant the screen color
                  changes to green until user input is recorded. Tests use randomized delays (1.2s to 4.0s) and average 5
                  consecutive trials.
                </p>
              </Card>
            </div>
          </section>

          {/* Section 6: General WPM Reference Ranges */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">6. General WPM Reference Ranges</h2>
            <p>
              Typing speed varies greatly depending on human factors (fatigue, alertness, touch typing experience),
              hardware differences (laptop membrane vs. mechanical switches), text difficulty, and test duration.
            </p>
            <p>
              The reference ranges shown on EnglishTypingTest.org represent <strong>general descriptive skill brackets</strong>,
              not universal population percentiles:
            </p>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface/60 text-foreground font-semibold">
                  <tr className="border-b border-border">
                    <th className="p-3">Skill Bracket</th>
                    <th className="p-3">WPM Range</th>
                    <th className="p-3">Typical Everyday &amp; Workplace Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-muted-foreground">
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Developing</td>
                    <td className="p-3 font-mono text-foreground">Under 30 WPM</td>
                    <td className="p-3">Novice touch typists or hunt-and-peck typists building key familiarity.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Everyday Pace</td>
                    <td className="p-3 font-mono text-foreground">30–45 WPM</td>
                    <td className="p-3">Common typing speed for casual computer users, email, and social messaging.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Intermediate</td>
                    <td className="p-3 font-mono text-foreground">45–65 WPM</td>
                    <td className="p-3">Comfortable touch typing speed suitable for general office work, reports, and writing.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Fluent</td>
                    <td className="p-3 font-mono text-foreground">65–85 WPM</td>
                    <td className="p-3">High-velocity typing pace common among software developers, writers, and customer support.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Advanced</td>
                    <td className="p-3 font-mono text-foreground">85+ WPM</td>
                    <td className="p-3">Top-tier typing proficiency on standard computer keyboards.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <em>Disclaimer:</em> Official employment requirements vary significantly by employer and jurisdiction.
              Court reporting and official stenography require specialized chorded machines operating at 225+ WPM,
              not standard QWERTY keyboards.
            </p>
          </section>

          {/* Section 7: Questions or Discrepancies */}
          <section className="space-y-4 rounded-xl border border-border/80 bg-surface/20 p-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Reporting Mathematical or Engine Inconsistencies
            </h3>
            <p className="text-sm">
              If your test results do not match the formulas documented on this page, or if you identify a clock drift
              issue on your specific browser or operating system, please file an engine issue:
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/report-error"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Report Calculation Discrepancy
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-elevated text-foreground"
              >
                Back to About Platform
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
