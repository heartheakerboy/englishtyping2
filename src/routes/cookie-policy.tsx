import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Cookie, ShieldCheck, Database, Settings, HelpCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — EnglishTypingTest.org" },
      {
        name: "description",
        content:
          "Read the EnglishTypingTest.org Cookie Policy: how we use local storage, session data, and privacy-respecting advertising cookies.",
      },
      { property: "og:title", content: "Cookie Policy — EnglishTypingTest.org" },
      {
        property: "og:description",
        content:
          "Read the EnglishTypingTest.org Cookie Policy: how we use local storage, session data, and privacy-respecting advertising cookies.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/cookie-policy" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/cookie-policy" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Cookie Policy",
          url: "https://www.englishtypingtest.org/cookie-policy",
          description:
            "EnglishTypingTest.org cookie and local storage disclosure policy.",
          publisher: {
            "@type": "Organization",
            name: "English Typing Test",
            url: "https://www.englishtypingtest.org/",
          },
        }),
      },
    ],
  }),
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Transparency &amp; Storage Disclosure
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Cookie &amp; Local Storage Policy
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            We are dedicated to transparent web publishing. This policy explains what cookies and local storage keys
            are used on EnglishTypingTest.org and how you can manage them.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Effective Date: January 1, 2026</span>
            <span>•</span>
            <span>Last Updated: September 2026</span>
            <span>•</span>
            <span>Maintained by: English Typing Test Team (support@englishtypingtest.org)</span>
          </div>
        </div>

        <div className="mt-10 space-y-12 leading-relaxed text-muted-foreground text-base">
          {/* Section 1: What are cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Cookie className="h-6 w-6 text-primary" />
              1. What Are Cookies and Web Storage?
            </h2>
            <p>
              Cookies are small data files placed on your computer or mobile device when you visit a website. In addition
              to standard cookies, modern web applications utilize <strong>HTML5 Local Storage</strong> (localStorage)
              and <strong>Session Storage</strong> (sessionStorage) to store lightweight application state directly on
              your machine.
            </p>
            <p>
              At EnglishTypingTest.org, we prioritize privacy: <strong>we do not track your keystrokes</strong>, and
              our practice tools run client-side to minimize unnecessary server transmission.
            </p>
          </section>

          {/* Section 2: Essential Storage */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-6 w-6 text-emerald-500" />
              2. Essential Local Storage Keys
            </h2>
            <p>
              These client-side keys are strictly necessary to provide features you explicitly request, such as dark
              mode and high score tracking:
            </p>

            <div className="grid gap-3 sm:grid-cols-2 mt-4">
              <Card className="p-4 border-border/70 bg-surface/30 space-y-1">
                <code className="text-xs font-mono text-primary font-bold">ett-theme</code>
                <p className="text-xs text-muted-foreground">
                  Stores your chosen theme preference (dark or light mode) across browsing sessions.
                </p>
              </Card>

              <Card className="p-4 border-border/70 bg-surface/30 space-y-1">
                <code className="text-xs font-mono text-primary font-bold">ett-lang</code>
                <p className="text-xs text-muted-foreground">
                  Remembers your selected interface language preference so pages load in your desired locale.
                </p>
              </Card>

              <Card className="p-4 border-border/70 bg-surface/30 space-y-1">
                <code className="text-xs font-mono text-primary font-bold">cps_best_score</code>
                <p className="text-xs text-muted-foreground">
                  Stores your personal best click score in the reflex mini-drill locally on your browser.
                </p>
              </Card>

              <Card className="p-4 border-border/70 bg-surface/30 space-y-1">
                <code className="text-xs font-mono text-primary font-bold">memory_best_score</code>
                <p className="text-xs text-muted-foreground">
                  Saves your personal memory score locally without sending game telemetry to remote servers.
                </p>
              </Card>
            </div>
          </section>

          {/* Section 3: Advertising */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6 text-amber-500" />
              3. Advertising Cookies (Google AdSense)
            </h2>
            <p>
              To maintain EnglishTypingTest.org as a 100% free educational platform, we display non-intrusive display
              advertisements provided by Google AdSense:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                Google uses cookies (such as the DoubleClick cookie) to serve relevant advertisements based on prior
                visits to our website or other sites on the Internet.
              </li>
              <li>
                You may opt out of personalized advertising at any time by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium"
                >
                  Google Ads Settings
                </a>
                .
              </li>
              <li>
                Alternatively, you can opt out of third-party vendor cookies for personalized advertising through{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium"
                >
                  www.aboutads.info
                </a>
                .
              </li>
            </ul>
          </section>

          {/* Section 4: How to Control Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              4. How You Can Control Cookies
            </h2>
            <p>
              You have the right to accept or decline cookies. Most modern web browsers automatically accept cookies,
              but you can modify your browser settings to decline or clear them at any time:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Third-party cookies.
              </li>
              <li>
                <strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data.
              </li>
              <li>
                <strong>Apple Safari:</strong> Settings &gt; Safari &gt; Advanced &gt; Privacy.
              </li>
              <li>
                <strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions.
              </li>
            </ul>
            <p className="text-sm">
              Please note that disabling local storage may reset your dark mode preference and personal high scores back
              to default values.
            </p>
          </section>

          {/* Section 5: Contact */}
          <section className="space-y-4 rounded-xl border border-border/80 bg-surface/30 p-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Questions About Our Cookie Policy?
            </h3>
            <p className="text-sm">
              If you have any questions about our use of cookies or local data practices, please reach out to our team:
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/privacy"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Read Privacy Policy
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-elevated text-foreground"
              >
                <Mail className="h-4 w-4 mr-2" /> Contact Us
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
