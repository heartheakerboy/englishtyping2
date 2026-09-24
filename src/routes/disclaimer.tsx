import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, Award, ExternalLink, HelpCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — EnglishTypingTest.org" },
      {
        name: "description",
        content:
          "Official legal and educational disclaimer for EnglishTypingTest.org: exam preparation accuracy, non-affiliation, external links, and intellectual property.",
      },
      { property: "og:title", content: "Disclaimer — EnglishTypingTest.org" },
      {
        property: "og:description",
        content:
          "Official legal and educational disclaimer for EnglishTypingTest.org: exam preparation accuracy, non-affiliation, external links, and intellectual property.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/disclaimer" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/disclaimer" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Disclaimer",
          url: "https://www.englishtypingtest.org/disclaimer",
          description: "Legal and educational disclaimer for EnglishTypingTest.org.",
          publisher: {
            "@type": "Organization",
            name: "English Typing Test",
            url: "https://www.englishtypingtest.org/",
          },
        }),
      },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">
            Legal &amp; Educational Disclaimers
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Disclaimer
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Please read this disclaimer carefully before relying on test calculations, exam preparation guides, or
            educational articles on EnglishTypingTest.org.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Effective Date: January 1, 2026</span>
            <span>•</span>
            <span>Last Updated: September 2026</span>
            <span>•</span>
            <span>Operator: English Typing Test Team (support@englishtypingtest.org)</span>
          </div>
        </div>

        <div className="mt-10 space-y-12 leading-relaxed text-muted-foreground text-base">
          {/* Section 1: Educational and Skill Purpose */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              1. Educational &amp; Self-Improvement Purpose
            </h2>
            <p>
              EnglishTypingTest.org is an independent online educational platform designed to help typists evaluate
              their keystroke speed (WPM, CPM), typing accuracy percentage, and keyboard reflexes.
            </p>
            <p>
              While our scoring algorithms adhere strictly to standardized word metrics (<strong>5 keystrokes = 1 word</strong>),
              test results achieved on our platform are for informational, training, and self-assessment purposes only.
              We do not issue official state certifications or civil service accreditation licenses.
            </p>
          </section>

          {/* Section 2: Non-Affiliation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
              2. Government &amp; Examination Non-Affiliation
            </h2>
            <p>
              EnglishTypingTest.org is an independent software project and is{" "}
              <strong className="text-foreground">
                not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected
                with
              </strong>{" "}
              the Staff Selection Commission (SSC), Maharashtra State Council of Examination (GCC-TBC), Railway
              Recruitment Board (RRB), High Court Examination Boards, or any other government or municipal agency.
            </p>
            <p>
              All examination simulators (e.g., SSC CGL, SSC CHSL, GCC-TBC practice modes) are provided solely as
              simulated practice drills based on publicly available syllabi conventions. Candidates must always verify
              official testing notifications and rules directly from the relevant authorized government websites.
            </p>
          </section>

          {/* Section 3: Hardware and Software Variability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              3. Measurement Variability &amp; Latency
            </h2>
            <p>
              Keystroke measurements and reaction timers can vary depending on external physical factors outside our
              control, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                Physical keyboard hardware switch type (mechanical, membrane, scissor-switch, or optical switches).
              </li>
              <li>Keyboard polling rate and USB bus latency.</li>
              <li>Browser background process loads and display monitor refresh rates (60Hz vs 144Hz+).</li>
              <li>Operating system accessibility key-repeat settings and sticky-key configurations.</li>
            </ul>
          </section>

          {/* Section 4: External Links */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ExternalLink className="h-6 w-6 text-blue-500" />
              4. External Links Disclaimer
            </h2>
            <p>
              EnglishTypingTest.org may contain links to external third-party websites or services that are not operated
              or controlled by us. We do not warrant, endorse, guarantee, or assume responsibility for the accuracy,
              relevance, or completeness of any information found on third-party websites.
            </p>
          </section>

          {/* Section 5: Contact */}
          <section className="space-y-4 rounded-xl border border-border/80 bg-surface/30 p-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Questions or Concerns?
            </h3>
            <p className="text-sm">
              If you have any questions regarding this disclaimer, our measurement methodology, or our terms, please
              contact us:
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/methodology"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Measurement Methodology
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-elevated text-foreground"
              >
                <Mail className="h-4 w-4 mr-2" /> Contact Support
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
