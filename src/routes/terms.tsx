import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { FileText, ShieldAlert, Award, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — EnglishTypingTest.org" },
      {
        name: "description",
        content:
          "Terms of Service for EnglishTypingTest.org: acceptable use, leaderboard rules, intellectual property, and service disclaimers.",
      },
      { property: "og:title", content: "Terms of Service — EnglishTypingTest.org" },
      {
        property: "og:description",
        content:
          "Terms of Service for EnglishTypingTest.org: acceptable use, leaderboard rules, intellectual property, and service disclaimers.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/terms" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Legal Terms &amp; Conditions
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Terms of Service
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Please read these Terms of Service carefully before utilizing EnglishTypingTest.org. By accessing our
            services, you agree to these terms.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Effective Date: January 1, 2026</span>
            <span>•</span>
            <span>Last Updated: September 2026</span>
            <span>•</span>
            <span>Operator: English Typing Test Team (support@englishtypingtest.org)</span>
          </div>
        </div>

        <div className="mt-10 space-y-10 leading-relaxed text-muted-foreground text-base">
          {/* Section 1: Acceptance */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              1. Acceptance of Terms
            </h2>
            <p>
              EnglishTypingTest.org provides free educational typing evaluation tools, practice passages, arcade speed
              games, and multiplayer races. By accessing or using any feature on our website, you agree to be bound by
              these Terms of Service and our <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* Section 2: Acceptable Use & Anti-Cheat */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
              2. Acceptable Use &amp; Leaderboard Integrity
            </h2>
            <p>
              Our platform thrives on fair, honest competition and genuine skill improvement. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Use automated scripts, browser macros, autotypers, or bot injections to manipulate test results or
                pollute the public leaderboards.
              </li>
              <li>
                Attempt to bypass server bounds validation (<code className="text-xs bg-surface/60 px-1 py-0.5 rounded font-mono">max 350 WPM</code>)
                or inject fabricated scores into the database.
              </li>
              <li>
                Engage in denial-of-service attempts, unauthorized scraping, or disruptions to our WebSocket multiplayer
                infrastructure.
              </li>
            </ul>
            <p className="text-sm">
              We reserve the right to remove any score from the public leaderboards that is determined by our moderation
              tools or maintainers to be fraudulent or automated.
            </p>
          </section>

          {/* Section 3: Educational Disclaimers */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              3. Educational Purpose &amp; Certifications
            </h2>
            <p>
              EnglishTypingTest.org is an independent educational training tool. While our test formats (such as SSC CGL
              and GCC-TBC) are modeled after official examination syllabi, completion certificates generated on
              EnglishTypingTest.org represent self-paced benchmark practice and do not replace official government or
              institutional proctored exam credentials.
            </p>
          </section>

          {/* Section 4: Disclaimers of Warranty */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              4. Disclaimer of Warranties
            </h2>
            <p>
              The platform and all materials are provided "as is" and "as available" without warranty of any kind,
              express or implied. We do not warrant that test services will be uninterrupted, error-free, or compatible
              with every hardware keyboard configuration or browser environment.
            </p>
          </section>

          {/* Section 5: Governing Law & Contact */}
          <section className="rounded-xl border border-border/80 bg-surface/20 p-6 space-y-3">
            <h3 className="text-lg font-bold text-foreground">5. Questions &amp; Inquiries</h3>
            <p className="text-sm">
              If you have any questions regarding these Terms, please contact our administrative team:
            </p>
            <div className="font-mono text-sm text-foreground bg-background/80 p-3 rounded border border-border/60">
              EnglishTypingTest.org Administrative Team
              <br />
              Email: <a href="mailto:support@englishtypingtest.org" className="text-primary underline">support@englishtypingtest.org</a>
              <br />
              Subject: <span className="text-muted-foreground">[Terms Inquiry]</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
