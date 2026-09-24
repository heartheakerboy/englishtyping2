import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, Database, EyeOff, Cookie, UserX } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — EnglishTypingTest.org" },
      {
        name: "description",
        content:
          "Read the EnglishTypingTest.org privacy policy: zero keystroke logging, client-side text processing, local storage use, and transparent data handling.",
      },
      { property: "og:title", content: "Privacy Policy — EnglishTypingTest.org" },
      {
        property: "og:description",
        content:
          "Read the EnglishTypingTest.org privacy policy: zero keystroke logging, client-side text processing, local storage use, and transparent data handling.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/privacy" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Data Protection &amp; Transparency
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            We believe your typing habits and custom texts belong entirely to you. This policy details exactly what
            data we process, what we do not collect, and how your privacy is protected.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Effective Date: January 1, 2026</span>
            <span>•</span>
            <span>Last Audited: September 2026</span>
            <span>•</span>
            <span>Operator: English Typing Test Team (support@englishtypingtest.org)</span>
          </div>
        </div>

        <div className="mt-10 space-y-10 leading-relaxed text-muted-foreground text-base">
          {/* Section 1: Summary */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              1. Core Privacy Commitments
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5 border-border/60 bg-surface/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <EyeOff className="h-5 w-5 text-emerald-500" /> No Keystroke Recording
                </div>
                <p className="text-sm">
                  The characters you type during tests are evaluated strictly in your browser's local memory (React state).
                  Keystroke data is never recorded, streamed, or saved to any database.
                </p>
              </Card>

              <Card className="p-5 border-border/60 bg-surface/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Lock className="h-5 w-5 text-emerald-500" /> Local Custom Texts
                </div>
                <p className="text-sm">
                  Custom practice passages you paste into the test runner are stored exclusively in your browser's private{" "}
                  <code className="text-xs bg-surface/60 px-1 py-0.5 rounded">localStorage</code>. They never reach our servers.
                </p>
              </Card>
            </div>
          </section>

          {/* Section 2: Data We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              2. Information We Process
            </h2>
            <p>
              Depending on how you use EnglishTypingTest.org, the following limited information may be processed:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="text-foreground">Anonymous Visitors (No Account):</strong> You can take unlimited
                typing tests, lessons, and arcade games without providing any personal information. No account or email
                is required. High scores and theme preferences are saved locally on your device via{" "}
                <code className="text-xs bg-surface/60 px-1 py-0.5 rounded">localStorage</code>.
              </li>
              <li>
                <strong className="text-foreground">Registered Users (Optional):</strong> If you choose to create an
                account to track your progress across devices, we collect your email address and authentication credentials
                via our identity provider, Supabase Auth.
              </li>
              <li>
                <strong className="text-foreground">Saved Test Results:</strong> For authenticated users who complete a
                test, we record aggregate numerical scores: Net WPM, Raw WPM, Accuracy %, CPM, Consistency %, correct/incorrect
                character counts, test mode (e.g. "time:60"), and timestamp. We do not store the text that was typed.
              </li>
              <li>
                <strong className="text-foreground">Multiplayer Race Data:</strong> In live multiplayer rooms, ephemeral
                progress indicators (e.g. current progress 45%, live WPM) are broadcast in real-time to other racers in
                the room via Supabase Realtime channels. These ephemeral messages expire upon race conclusion.
              </li>
            </ul>
          </section>

          {/* Section 3: Cookies & Local Storage */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Cookie className="h-6 w-6 text-primary" />
              3. Cookies &amp; Local Storage Usage
            </h2>
            <p>
              We use browser storage technologies for essential platform functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <code className="text-xs bg-surface/60 px-1 py-0.5 rounded font-mono">ett-theme</code>: Stores your
                preferred UI theme (dark or light mode).
              </li>
              <li>
                <code className="text-xs bg-surface/60 px-1 py-0.5 rounded font-mono">ett-lang</code>: Remembers your selected
                interface language.
              </li>
              <li>
                <code className="text-xs bg-surface/60 px-1 py-0.5 rounded font-mono">cps_best_score</code> /{" "}
                <code className="text-xs bg-surface/60 px-1 py-0.5 rounded font-mono">memory_best_score</code>: Stores personal
                best arcade game scores locally on your machine.
              </li>
            </ul>
          </section>

          {/* Section 4: Third-Party Services */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Third-Party Service Providers</h2>
            <p>
              We rely on reputable infrastructure providers to deliver our free educational service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Supabase:</strong> Provides secure authentication, PostgreSQL database storage, and WebSocket
                channels for live multiplayer rooms.
              </li>
              <li>
                <strong>Google AdSense:</strong> We display non-intrusive advertisements to help support platform hosting
                and ongoing development. Google may use cookies to serve ads based on prior visits. You can opt out of
                personalized advertising via Google Ads Settings.
              </li>
              <li>
                <strong>Vercel &amp; Cloudflare:</strong> Hosts our web application and provides secure SSL/TLS
                encryption and content delivery network (CDN) caching.
              </li>
            </ul>
          </section>

          {/* Section 5: Data Rights & Account Deletion */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserX className="h-6 w-6 text-primary" />
              5. Your Rights &amp; Account Deletion
            </h2>
            <p>
              You have complete control over your data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Clear Local Data:</strong> You can wipe your local high scores, custom texts, and preferences at
                any time simply by clearing your browser's site data or cache for <code className="text-xs">englishtypingtest.org</code>.
              </li>
              <li>
                <strong>Delete Your Account:</strong> Registered users can request complete account deletion and erasure of
                all historical test records by emailing{" "}
                <a href="mailto:support@englishtypingtest.org?subject=Account%20Deletion%20Request" className="text-primary underline">
                  support@englishtypingtest.org
                </a>
                . All associated records in Supabase will be permanently removed within 30 days.
              </li>
            </ul>
          </section>

          {/* Section 6: Contact */}
          <section className="rounded-xl border border-border/80 bg-surface/20 p-6 space-y-3">
            <h3 className="text-lg font-bold text-foreground">Contact Privacy Team</h3>
            <p className="text-sm">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our
              designated privacy coordinator:
            </p>
            <div className="font-mono text-sm text-foreground bg-background/80 p-3 rounded border border-border/60">
              Email: <a href="mailto:support@englishtypingtest.org" className="text-primary underline">support@englishtypingtest.org</a>
              <br />
              Subject: <span className="text-muted-foreground">[Privacy Inquiry]</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
