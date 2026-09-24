import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { ShieldCheck, BookOpen, CheckCircle, RefreshCw, AlertTriangle, Sparkles, Send } from "lucide-react";

export const Route = createFileRoute("/editorial-policy")({
  head: () => ({
    meta: [
      { title: "Editorial Policy & Content Standards — EnglishTypingTest.org" },
      {
        name: "description",
        content:
          "Read our editorial standards: how we source typing research, verify mathematical formulas, maintain factual accuracy, handle AI assistance, and correct errors.",
      },
      { property: "og:title", content: "Editorial Policy & Content Standards" },
      {
        property: "og:description",
        content:
          "Read our editorial standards: how we source typing research, verify mathematical formulas, maintain factual accuracy, handle AI assistance, and correct errors.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/editorial-policy" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/editorial-policy" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Editorial Policy and Content Standards for EnglishTypingTest.org",
          url: "https://www.englishtypingtest.org/editorial-policy",
          description:
            "Standards for research verification, technical correctness, AI transparency, and error corrections at EnglishTypingTest.org.",
          publisher: {
            "@type": "Organization",
            name: "English Typing Test",
            url: "https://www.englishtypingtest.org/",
          },
        }),
      },
    ],
  }),
  component: EditorialPolicyPage,
});

function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            E-E-A-T &amp; Trust Guidelines
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Editorial Policy &amp; Content Standards
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Our commitment to factual truthfulness, mathematical accuracy, transparent methodology, and
            uncompromising educational integrity.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Published: February 2026</span>
            <span>•</span>
            <span>Last Reviewed: September 2026</span>
            <span>•</span>
            <span>Maintained by: EnglishTypingTest.org Editorial Board</span>
          </div>
        </div>

        <div className="mt-10 space-y-12 leading-relaxed text-muted-foreground text-base">
          {/* Section 1: Core Mission */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              1. Our Educational Mission
            </h2>
            <p>
              EnglishTypingTest.org exists to empower students, job applicants, data entry operators, software
              engineers, and casual typists to improve their typing fluency. Because our users rely on our tests to
              prepare for official exams (such as SSC CGL, GCC-TBC, and civil service tests), we treat factual accuracy,
              measurement integrity, and editorial honesty as our highest priorities.
            </p>
            <p>
              We firmly reject the practice of manufacturing false authority, inventing non-existent academic titles,
              fabricating user statistics, or exaggerating scientific claims for marketing or SEO leverage.
            </p>
          </section>

          {/* Section 2: Research & Sourcing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              2. Sourcing &amp; Research Standards
            </h2>
            <p>
              Every educational guide, tutorial, and technical reference published on EnglishTypingTest.org must adhere
              to strict sourcing criteria:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Government &amp; Examination Syllabi:</strong> Articles describing official typing tests (e.g.
                SSC CGL, CHSL, GCC-TBC) must reference actual published government qualification notices, specifying
                prescribed durations (e.g. 15 minutes), key depression requirements (e.g. 10,500 KDPH / 35 WPM), and
                error allowances.
              </li>
              <li>
                <strong>Scientific &amp; Cognitive Claims:</strong> When discussing motor learning, memory, reaction times,
                or fatigue, claims must reflect established principles of cognitive psychology and human physiology. We
                strictly prohibit uncited claims like "boosts neural conductivity" or "guaranteed 40% speed increase."
              </li>
              <li>
                <strong>Ergonomics &amp; Health:</strong> Repetitive Strain Injury (RSI) and Carpal Tunnel prevention
                guidelines must align with recognized occupational safety bodies (e.g. OSHA standards for workstation
                ergonomics).
              </li>
            </ul>
          </section>

          {/* Section 3: Technical & Mathematical Accuracy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              3. Technical &amp; Formula Verification
            </h2>
            <p>
              A major hazard of online typing sites is a disconnect between marketing copy and software code. On
              EnglishTypingTest.org:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All published definitions of Gross WPM, Net WPM, Accuracy, CPM, and Consistency must reflect the exact
                code running in <code className="text-xs bg-surface/50 px-1 py-0.5 rounded font-mono">src/lib/typing-engine.ts</code>.
              </li>
              <li>
                If changes are made to the engine's calculation logic (e.g. handling backspaces or error penalties),
                our <Link to="/methodology" className="text-primary underline">Methodology Page</Link> and all related
                guides must be updated simultaneously.
              </li>
              <li>
                We do not claim features (such as "AI-driven real-time tutoring" or "military-grade security") unless
                they are genuinely implemented in the software.
              </li>
            </ul>
          </section>

          {/* Section 4: AI Assistance Transparency */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              4. AI Assistance Transparency Policy
            </h2>
            <p>
              We believe in complete transparency regarding the role of Artificial Intelligence:
            </p>
            <Card className="p-5 border-border/60 bg-surface/20 space-y-3">
              <p className="text-sm">
                <strong className="text-foreground">Content Creation:</strong> Artificial Intelligence tools (such as
                large language models) may be utilized by our editorial staff for drafting outlines, grammar checking,
                or summarizing large reference documents. However:
              </p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Every article is reviewed, fact-checked, and approved by human team members prior to publication.</li>
                <li>AI is never credited as a "certified human typing expert" or "academic authority."</li>
                <li>Factual claims and mathematical formulas are independently verified against code and source documents.</li>
              </ul>
              <p className="text-sm">
                <strong className="text-foreground">AI-Generated Practice Passages:</strong> When users utilize custom
                AI prompt generation for practice passages, the generated text is intended solely for keyboard typing
                drills and may contain creative or informal text.
              </p>
            </Card>
          </section>

          {/* Section 5: Corrections & Reporting Policy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-primary" />
              5. Corrections &amp; Reporting Policy
            </h2>
            <p>
              When an error occurs, our policy is prompt, transparent correction:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Submission:</strong> Any user can submit an error report via our{" "}
                <Link to="/report-error" className="text-primary underline">Report an Error</Link> page or by emailing{" "}
                <a href="mailto:support@englishtypingtest.org" className="text-primary underline">support@englishtypingtest.org</a>.
              </li>
              <li>
                <strong className="text-foreground">Review:</strong> Our engineering or editorial team reviews the
                report against the engine codebase or primary source documentation.
              </li>
              <li>
                <strong className="text-foreground">Resolution:</strong> If an error is verified, code or content is
                promptly updated, and the page's "Last Reviewed" date is updated.
              </li>
              <li>
                <strong className="text-foreground">Transparency:</strong> We do not silently mask historical calculation
                mistakes; major methodology adjustments are logged on our Methodology page.
              </li>
            </ol>
          </section>

          {/* Section 6: User Protection & Safety */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              6. Health, Ergonomics &amp; Safety Disclaimers
            </h2>
            <p>
              High-intensity typing drills (especially rapid click tests and marathon sessions) carry ergonomic risks.
              Our editorial policy mandates that any drill with potential physical strain includes clear ergonomic
              warnings regarding wrist positioning, relaxed posture, and taking mandatory rest intervals.
            </p>
            <p>
              Typing tests and educational materials on EnglishTypingTest.org are educational aids and do not constitute
              formal medical or physical therapy advice.
            </p>
          </section>

          {/* Section 7: Contact Editorial */}
          <section className="rounded-xl border border-border/80 bg-surface/20 p-6 space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Contact Our Editorial Team
            </h3>
            <p className="text-sm">
              Questions regarding our sources, methodology, or editorial guidelines can be directed to:
            </p>
            <div className="font-mono text-sm text-foreground bg-background/80 p-3 rounded border border-border/60">
              EnglishTypingTest.org Editorial Team
              <br />
              Email: <a href="mailto:support@englishtypingtest.org" className="text-primary underline">support@englishtypingtest.org</a>
              <br />
              Subject Line: <span className="text-muted-foreground">[Editorial Inquiry] or [Correction Request]</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
