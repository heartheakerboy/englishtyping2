import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Terminal,
  BookOpen,
  AlertCircle,
  HeartHandshake,
  ExternalLink,
  Github,
  Linkedin,
  Code2,
  Sparkles,
  Gamepad2,
  Timer,
  FileText,
  Mail,
  Layers,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EnglishTypingTest.org | Our Story & Developer" },
      {
        name: "description",
        content:
          "Learn about EnglishTypingTest.org, an open, distraction-free typing platform created by Full Stack Developer Firoz Khan (FK Digital Media) for accurate, privacy-first typing assessment.",
      },
      { property: "og:title", content: "About EnglishTypingTest.org | Our Story & Developer" },
      {
        property: "og:description",
        content:
          "Learn about EnglishTypingTest.org, an open, distraction-free typing platform created by Full Stack Developer Firoz Khan (FK Digital Media) for accurate, privacy-first typing assessment.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/about" },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://www.englishtypingtest.org/images/firoz-khan-full-stack-developer.webp",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About EnglishTypingTest.org | Our Story & Developer" },
      {
        name: "twitter:description",
        content:
          "Learn about EnglishTypingTest.org, an open, distraction-free typing platform created by Full Stack Developer Firoz Khan (FK Digital Media) for accurate, privacy-first typing assessment.",
      },
      {
        name: "twitter:image",
        content: "https://www.englishtypingtest.org/images/firoz-khan-full-stack-developer.webp",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "AboutPage",
              "@id": "https://www.englishtypingtest.org/about#webpage",
              url: "https://www.englishtypingtest.org/about",
              name: "About EnglishTypingTest.org | Our Story & Developer",
              description:
                "Platform mission, developer background, mathematical methodology, and transparency information for EnglishTypingTest.org.",
              isPartOf: {
                "@type": "WebSite",
                "@id": "https://www.englishtypingtest.org/#website",
                name: "English Typing Test",
                url: "https://www.englishtypingtest.org/",
              },
              about: {
                "@id": "https://www.englishtypingtest.org/about#person",
              },
              publisher: {
                "@id": "https://www.englishtypingtest.org/#organization",
              },
              inLanguage: "en",
            },
            {
              "@type": "Person",
              "@id": "https://www.englishtypingtest.org/about#person",
              name: "Firoz Khan",
              jobTitle: "Full Stack Developer",
              image: "https://www.englishtypingtest.org/images/firoz-khan-full-stack-developer.webp",
              worksFor: {
                "@type": "Organization",
                name: "FK Digital Media",
                url: "https://www.englishtypingtest.org/",
              },
              description:
                "Firoz Khan is a Full Stack Developer and the creator behind FK Digital Media. He works on web applications, online tools, and digital products, with a focus on building practical, fast, and user-friendly web experiences.",
              sameAs: [
                "https://www.linkedin.com/in/firoz-khan-1153358a/",
                "https://github.com/fkdigitalmedia",
              ],
            },
            {
              "@type": "Organization",
              "@id": "https://www.englishtypingtest.org/#organization",
              name: "English Typing Test",
              alternateName: "FK Digital Media",
              url: "https://www.englishtypingtest.org/",
              logo: "https://www.englishtypingtest.org/favicon.svg",
              founder: {
                "@id": "https://www.englishtypingtest.org/about#person",
              },
              sameAs: [
                "https://github.com/fkdigitalmedia",
              ],
            },
          ],
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

        {/* Page Hero */}
        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Platform Transparency &amp; Creator Story
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            About EnglishTypingTest.org
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            A fast, distraction-free educational platform created to provide mathematically honest typing speed
            evaluations, structured keyboard training, and zero-compromise user privacy.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Created by: Firoz Khan (FK Digital Media)</span>
            <span>•</span>
            <span>Published: January 2026</span>
            <span>•</span>
            <span>Last Updated: September 2026</span>
          </div>
        </div>

        <div className="mt-10 space-y-14 leading-relaxed text-muted-foreground text-base">
          {/* Section 1: Why We Built EnglishTypingTest.org */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Why We Built EnglishTypingTest.org
            </h2>
            <p>
              Touch typing is one of the most compounding practical skills in the digital age. Whether preparing for
              government examination benchmarks (such as SSC CGL, SSC CHSL, or GCC-TBC), drafting software code,
              responding to customer support inquiries, or writing academic research, keyboard speed and accuracy
              directly impact daily productivity and confidence.
            </p>
            <p>
              However, many online typing tests are cluttered with intrusive display advertisements, compulsory user
              registration, heavy tracker scripts that introduce typing latency, or lenient scoring formulas that
              give users an inflated sense of ability.
            </p>
            <p>
              EnglishTypingTest.org was created with a straightforward mission:{" "}
              <strong className="text-foreground">
                to provide an open, blazingly fast, privacy-first typing environment that implements standard
                examination scoring conventions without paywalls, bloat, or distractions.
              </strong>
            </p>

            <div className="mt-4 rounded-xl border border-border/70 bg-surface/30 p-5">
              <h3 className="text-base font-semibold text-foreground mb-2">Who the Platform Is Designed For:</h3>
              <ul className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Competitive Exam Aspirants:</strong> Candidates preparing for
                    SSC, High Court, GCC-TBC, and civil service typing tests requiring exact 5-keystroke calculations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Students &amp; Keyboard Beginners:</strong> Learners building
                    muscle memory through progressive home-row to symbol touch typing lessons.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Software Engineers &amp; Writers:</strong> Professionals
                    practicing coding syntax, special punctuation, and long-form prose with custom text inputs.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Reflex &amp; Speed Enthusiasts:</strong> Typists testing their
                    peak motor limits through games, CPS tests, and reaction timers.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Meet the Developer (Founder Profile) */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Creator &amp; Maintainer
              </Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Meet the Developer
            </h2>

            <Card className="overflow-hidden border-border/80 bg-surface/40 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                <div className="shrink-0">
                  <div className="relative h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-md">
                    <img
                      src="/images/firoz-khan-full-stack-developer.webp"
                      alt="Firoz Khan, Full Stack Developer at FK Digital Media"
                      width={280}
                      height={280}
                      className="h-full w-full object-cover object-top transition-transform hover:scale-105 duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Firoz Khan</h3>
                    <p className="text-sm font-medium text-primary">
                      Full Stack Developer • Creator of FK Digital Media
                    </p>
                  </div>

                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground italic border-l-2 border-primary/40 pl-3 py-1">
                    &ldquo;Firoz Khan is a Full Stack Developer and the creator behind FK Digital Media. He works on
                    web applications, online tools, and digital products, with a focus on building practical, fast,
                    and user-friendly web experiences.&rdquo;
                  </p>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Firoz architected EnglishTypingTest.org to solve a real-world problem: providing students and typists
                    with an ultra-responsive, client-side keyboard platform that loads instantly, calculates typing
                    metrics with strict mathematical rigor, and protects user privacy by avoiding any server-side
                    keystroke telemetry.
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    <a
                      href="https://www.linkedin.com/in/firoz-khan-1153358a/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-elevated hover:text-primary transition-colors shadow-xs"
                      aria-label="Firoz Khan on LinkedIn"
                    >
                      <Linkedin className="h-4 w-4 text-sky-600" />
                      <span>LinkedIn</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>

                    <a
                      href="https://github.com/fkdigitalmedia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-elevated hover:text-primary transition-colors shadow-xs"
                      aria-label="FK Digital Media on GitHub"
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Section 3: FK Digital Media Brand Context */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              About FK Digital Media
            </h2>
            <p>
              <strong className="text-foreground">FK Digital Media</strong> is the independent digital brand behind
              projects including EnglishTypingTest.org. Built around modern web engineering principles, FK Digital
              Media focuses on developing lightweight, high-performance web utilities, accessible tools, and interactive
              learning software.
            </p>
            <p>
              We prioritize software craftsmanship over commercial bloat: no arbitrary paywalls, no forced user data
              harvesting, and zero deceptive dark patterns. Every tool released under the FK Digital Media banner is
              designed with direct accountability, transparent methodologies, and continuous user-driven improvements.
            </p>
          </section>

          {/* Section 4: What You Can Do on EnglishTypingTest.org */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              What You Can Do on EnglishTypingTest.org
            </h2>
            <p>
              Our platform offers a complete suite of keyboard training tools designed for all proficiency levels:
            </p>

            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <Card className="p-5 border-border/70 bg-surface/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <Timer className="h-5 w-5 text-primary" /> Timed Typing Tests
                  </div>
                  <p className="text-sm">
                    Evaluate your speed across standard intervals: 1-minute, 2-minute, 3-minute, 5-minute, 10-minute,
                    or 15-minute tests with live Net WPM, Gross WPM, CPM, and real-time accuracy scoring.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Link
                    to="/test"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Start a Timed Test <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>

              <Card className="p-5 border-border/70 bg-surface/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <FileText className="h-5 w-5 text-primary" /> Comprehensive Typing Test Hub
                  </div>
                  <p className="text-sm">
                    Browse our full directory of test configurations, including exam-mode simulators for SSC and GCC-TBC,
                    custom text input drills, and specific paragraph categories.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Link
                    to="/typing-test"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Explore All Typing Tests <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>

              <Card className="p-5 border-border/70 bg-surface/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Touch Typing Lessons
                  </div>
                  <p className="text-sm">
                    Master key positions without looking down. Follow structured, progressive exercises covering home row,
                    top row, bottom row, numeric keys, shift combinations, and punctuation symbols.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Link
                    to="/lessons"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Browse Touch Typing Lessons <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>

              <Card className="p-5 border-border/70 bg-surface/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <Gamepad2 className="h-5 w-5 text-primary" /> Interactive Typing Games
                  </div>
                  <p className="text-sm">
                    Build muscle memory through engaging gameplay. Challenge yourself with Type Invaders, Word Fall, Speed
                    Matrix, and multiplayer racing formats against friends or AI bots.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Link
                    to="/games"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Play Typing Games <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>

              <Card className="p-5 border-border/70 bg-surface/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <Cpu className="h-5 w-5 text-primary" /> Reflex &amp; Motor Skill Drills
                  </div>
                  <p className="text-sm">
                    Isolate hand-eye coordination with targeted mini-tools including Clicks Per Second (CPS) tests,
                    visual reaction speed drills, and spacebar cadence trainers.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Link
                    to="/cps-test"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Try Reflex Drills <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>

              <Card className="p-5 border-border/70 bg-surface/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <Terminal className="h-5 w-5 text-primary" /> Custom &amp; Code Drills
                  </div>
                  <p className="text-sm">
                    Paste your own study material, legal transcripts, medical terminology, or programming snippets into
                    the practice engine. Text is processed entirely locally on your device.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Link
                    to="/custom-typing-test"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Custom Text Practice <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 5: Our Approach to Accuracy & Honest Scoring */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Our Approach to Accuracy &amp; Honest Scoring
            </h2>
            <p>
              Why does typing accuracy measurement matter? Because casual websites that split words merely by spaces
              allow short words to inflate your WPM score by 15% to 25%. When candidates take official government or
              corporate typing examinations, they often face unexpected score drops.
            </p>
            <p>
              EnglishTypingTest.org enforces the universal international typographic standard:
            </p>
            <div className="rounded-xl border border-border/70 bg-surface/20 p-5 space-y-3">
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong className="text-foreground">Standardized Word Length:</strong> Exactly{" "}
                  <strong>5 characters = 1 standardized word</strong> (including spaces and punctuation).
                </li>
                <li>
                  <strong className="text-foreground">Gross WPM (Raw Speed):</strong> Total typed characters divided by 5,
                  normalized to elapsed minutes.
                </li>
                <li>
                  <strong className="text-foreground">Net WPM (Official Speed):</strong> Correct typed characters divided by
                  5, normalized to elapsed minutes. Uncorrected errors do not earn WPM credit.
                </li>
                <li>
                  <strong className="text-foreground">Accuracy Percentage:</strong> The exact ratio of correct keystrokes
                  to total attempted keystrokes.
                </li>
                <li>
                  <strong className="text-foreground">CPM (Characters Per Minute):</strong> Equal to Net WPM × 5, standard
                  across Indian and European civil service typing examinations.
                </li>
              </ul>
              <p className="text-xs text-muted-foreground pt-1">
                Learn the exact formulas, backspace penalties, and timing logic in our comprehensive{" "}
                <Link to="/methodology" className="text-primary underline font-medium">
                  Measurement Methodology
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Section 6: Editorial Integrity & Research Standards */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <HeartHandshake className="h-6 w-6 text-primary" />
              Editorial Integrity &amp; Quality Standards
            </h2>
            <p>
              We are committed to honest, verifiable educational publishing. We do not use sensationalized speed claims,
              invented testimonials, or artificial scientific studies.
            </p>
            <p>
              Our typing guides, keyboard posture recommendations, and exam syllabi breakdowns are verified against
              official testing notifications (such as the Staff Selection Commission and State Technical Board rules)
              and established ergonomic guidelines.
            </p>
            <p className="text-sm">
              Read our full principles on content review, source verification, and corrections in our{" "}
              <Link to="/editorial-policy" className="text-primary underline font-medium">
                Editorial Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 7: What We Are Actively Working to Improve */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              What We Are Actively Working to Improve
            </h2>
            <p>
              Development on EnglishTypingTest.org is continuous. Here are key technical initiatives we are currently
              rolling out:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-border/60 bg-surface/30 p-4">
                <h4 className="font-semibold text-foreground mb-1">Sub-Millisecond Keystroke Latency</h4>
                <p className="text-xs text-muted-foreground">
                  Refining the React virtual DOM render cycle to ensure zero input lag on 144Hz and 240Hz gaming monitors.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-surface/30 p-4">
                <h4 className="font-semibold text-foreground mb-1">Offline PWA Practice</h4>
                <p className="text-xs text-muted-foreground">
                  Improving service-worker caching so learners in low-connectivity areas can practice lessons without an
                  active internet connection.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-surface/30 p-4">
                <h4 className="font-semibold text-foreground mb-1">Finger Weakness Diagnostics</h4>
                <p className="text-xs text-muted-foreground">
                  Introducing detailed post-test heatmaps identifying slow finger transitions and frequently mistyped bigrams.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-surface/30 p-4">
                <h4 className="font-semibold text-foreground mb-1">Screen Reader Accessibility</h4>
                <p className="text-xs text-muted-foreground">
                  Enhancing ARIA live regions and keyboard-only focus loops to support low-vision and assistive keyboard users.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: Privacy-First Architecture */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              Privacy &amp; Data Protection
            </h2>
            <p>
              Your typing data belongs to you. Unlike platforms that stream your raw keystrokes to remote servers or use
              them to train third-party machine learning models, EnglishTypingTest.org is built on a strict privacy-first
              foundation:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong className="text-foreground">Client-Side Keystroke Evaluation:</strong> All keystroke comparison,
                WPM calculation, and accuracy checks occur locally in your browser memory. We never log or transmit the
                text you type.
              </li>
              <li>
                <strong className="text-foreground">Private Custom Drills:</strong> Any text or code pasted into our custom
                practice tools remains strictly on your device inside your browser&apos;s private local storage.
              </li>
              <li>
                <strong className="text-foreground">No Forced Sign-Ups:</strong> You can practice, take timed tests, and
                play typing games freely without ever creating an account.
              </li>
            </ul>
            <p className="text-sm">
              Read our complete commitment to user safety in our{" "}
              <Link to="/privacy" className="text-primary underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 9: Feedback & Community Support */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-surface/30 p-6 md:p-8">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Found an Error or Calculation Discrepancy?
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We hold our platform to the highest standards of accuracy and transparency. If you spot a typographical
              mistake in a practice paragraph, notice a timer irregularity, or have a suggestion to improve lesson flow,
              we welcome your direct feedback:
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild className="bg-primary text-primary-foreground shadow-sm hover:opacity-95">
                <Link to="/report-error">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report an Error
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-border hover:bg-surface-elevated">
                <Link to="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Or email our support inbox directly at{" "}
              <a
                href="mailto:support@englishtypingtest.org"
                className="text-primary font-mono font-medium underline"
              >
                support@englishtypingtest.org
              </a>{" "}
              (typical response time: 24 to 48 business hours).
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
