import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Cpu, Terminal, BookOpen, AlertCircle, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — English Typing Test Platform & Mission" },
      {
        name: "description",
        content:
          "Learn about EnglishTypingTest.org: our educational mission, platform capabilities, privacy practices, scoring transparency, and independent development team.",
      },
      { property: "og:title", content: "About Us — English Typing Test Platform & Mission" },
      {
        property: "og:description",
        content:
          "Learn about EnglishTypingTest.org: our educational mission, platform capabilities, privacy practices, scoring transparency, and independent development team.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/about" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About English Typing Test",
          url: "https://www.englishtypingtest.org/about",
          description:
            "Educational mission, technical architecture, scoring transparency, and operator information for EnglishTypingTest.org.",
          publisher: {
            "@type": "Organization",
            name: "English Typing Test",
            url: "https://www.englishtypingtest.org/",
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Platform Transparency &amp; Mission
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            About EnglishTypingTest.org
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            A free, distraction-free educational platform built to provide accurate typing speed evaluation,
            structured keyboard practice, and transparent keystroke analytics.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Published: January 2026</span>
            <span>•</span>
            <span>Last Reviewed &amp; Updated: September 2026</span>
            <span>•</span>
            <span>Maintained by: EnglishTypingTest.org Editorial &amp; Engineering Team</span>
          </div>
        </div>

        <div className="mt-10 space-y-12 leading-relaxed text-muted-foreground text-base">
          {/* Section 1: Why it was created */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Why EnglishTypingTest.org Was Created</h2>
            <p>
              In modern education, remote work, customer support, and administrative civil service, touch typing
              proficiency is a fundamental digital skill. However, many online typing tools are burdened with
              heavy ad clutter, forced account paywalls, slow loading times, or opaque scoring formulas that don't
              match standard typing examination conventions.
            </p>
            <p>
              EnglishTypingTest.org was developed with a singular objective: <strong>to offer a fast, 100% free,
              privacy-respecting, and mathematically transparent typing environment</strong> accessible to anyone with a
              modern web browser, regardless of device or location.
            </p>
          </section>

          {/* Section 2: What users can do */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">What You Can Do on the Platform</h2>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <Card className="p-5 border-border/60 bg-surface/30">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Timed Benchmark Tests
                </div>
                <p className="text-sm">
                  Test your typing speed across standard durations: 1-minute, 2-minute, 3-minute, 5-minute, 10-minute,
                  or 15-minute intervals with real-time Net WPM, Gross WPM, CPM, and accuracy telemetry.
                </p>
              </Card>

              <Card className="p-5 border-border/60 bg-surface/30">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <Terminal className="h-5 w-5 text-primary" /> Exam Format Simulators
                </div>
                <p className="text-sm">
                  Practice with realistic exam environments modeled after competitive typing tests, including SSC CGL /
                  CHSL (15 minutes, 2,000 keystrokes), GCC-TBC (7 minutes), and Live Chat customer support scenarios.
                </p>
              </Card>

              <Card className="p-5 border-border/60 bg-surface/30">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <Cpu className="h-5 w-5 text-primary" /> Speed &amp; Reflex Drills
                </div>
                <p className="text-sm">
                  Improve physical dexterity with targeted mini-drills, including Clicks Per Second (CPS), visual
                  Reaction Time tests, Spacebar cadence tests, and Row Trainer exercises.
                </p>
              </Card>

              <Card className="p-5 border-border/60 bg-surface/30">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Custom &amp; Code Practice
                </div>
                <p className="text-sm">
                  Paste your own custom text, articles, or code snippets for tailored drills. All custom text is
                  processed entirely on your local machine.
                </p>
              </Card>
            </div>
          </section>

          {/* Section 3: Scoring & Calculations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Scoring Methodology &amp; Mathematical Rigor</h2>
            <p>
              Unlike platforms that use arbitrary word splitting, EnglishTypingTest.org adheres to the universal
              standard word convention where <strong>1 standardized word = 5 characters</strong> (including spaces and
              punctuation).
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Gross (Raw) WPM:</strong> Total characters typed divided by 5,
                normalized to elapsed minutes.
              </li>
              <li>
                <strong className="text-foreground">Net WPM:</strong> Correct characters typed divided by 5,
                normalized to elapsed minutes. Uncorrected mistakes do not count toward Net WPM.
              </li>
              <li>
                <strong className="text-foreground">Accuracy:</strong> Ratio of correct characters to total typed
                characters, expressed as a percentage.
              </li>
              <li>
                <strong className="text-foreground">CPM:</strong> Correct characters per minute (equal to Net WPM × 5).
              </li>
            </ul>
            <p className="text-sm">
              For full mathematical formulas, consistency calculations, and backspace behavior, view our dedicated{" "}
              <Link to="/methodology" className="text-primary underline font-medium">
                Measurement Methodology Page
              </Link>
              .
            </p>
          </section>

          {/* Section 4: Privacy & Keystroke Handling */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              Privacy-First Architecture
            </h2>
            <p>
              Your typing data is sensitive. EnglishTypingTest.org is engineered with privacy as a foundational
              requirement:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>No Keystroke Logging:</strong> What you type is evaluated in volatile browser memory (client-side
                React state) only. The actual text you type is never recorded, transmitted across the network, or saved to
                any database.
              </li>
              <li>
                <strong>Custom Text Remains Local:</strong> Custom text pasted into the practice tool is stored strictly
                in your browser's private <code className="text-xs bg-surface/50 px-1 py-0.5 rounded">localStorage</code>.
              </li>
              <li>
                <strong>Zero Sign-Up Required:</strong> All tests, games, paragraph practice, and analysis tools are fully
                functional without creating an account.
              </li>
            </ul>
          </section>

          {/* Section 5: Who operates the site */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <HeartHandshake className="h-6 w-6 text-primary" />
              Who Operates the Website
            </h2>
            <p>
              EnglishTypingTest.org is an independent online educational project maintained by a dedicated team of web
              engineers and typing enthusiasts (the English Typing Test Team). We are not affiliated with any commercial
              hardware manufacturer, test proctoring monopoly, or government agency.
            </p>
            <p>
              We believe in honest, non-deceptive web publishing. We do not invent corporate identities, fictitious
              academic titles, fabricated user testimonials, or artificial social proof.
            </p>
          </section>

          {/* Section 6: Editorial & Content Review */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Content Review &amp; Quality Standards</h2>
            <p>
              Our guides, tips, and tutorials focus on practical, ergonomic touch typing and exam preparation. All
              formulas, keyboard row breakdowns, and exam format guides are reviewed directly against the codebase
              and verified public examination syllabi (such as SSC and GCC-TBC guidelines).
            </p>
            <p>
              Learn more about how we verify educational claims and technical tutorials in our{" "}
              <Link to="/editorial-policy" className="text-primary underline font-medium">
                Editorial Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 7: Feedback & Reporting */}
          <section className="space-y-4 rounded-xl border border-border/80 bg-surface/20 p-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Found an Error or Calculation Inconsistency?
            </h3>
            <p className="text-sm">
              We welcome community scrutiny. If you discover a typographical error, a discrepancy in test timing, an
              inaccurate exam guideline, or an unexpected calculation result, please notify us immediately:
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/report-error"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Submit an Error Report
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-elevated text-foreground"
              >
                Contact Support
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
