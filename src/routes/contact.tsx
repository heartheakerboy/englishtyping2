import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Mail, ShieldCheck, Bug, Copyright, Clock, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — EnglishTypingTest.org Support & Feedback" },
      {
        name: "description",
        content:
          "Get in touch with the EnglishTypingTest.org team for technical support, bug reports, privacy inquiries, and educational feedback.",
      },
      { property: "og:title", content: "Contact Us — EnglishTypingTest.org" },
      {
        property: "og:description",
        content:
          "Get in touch with the EnglishTypingTest.org team for technical support, bug reports, privacy inquiries, and educational feedback.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact English Typing Test",
          url: "https://www.englishtypingtest.org/contact",
          description: "Customer support, technical reporting, and general inquiries for EnglishTypingTest.org.",
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Direct Support Channels
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Contact EnglishTypingTest.org
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Have questions, found a bug, or need assistance? We are here to help. Reach out directly to our
            engineering and editorial maintainers.
          </p>
        </div>

        <div className="mt-10 space-y-10 leading-relaxed text-muted-foreground text-base">
          {/* Main Contact Card */}
          <Card className="p-8 border-primary/30 bg-surface/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Primary Support Email</h2>
                <p className="text-sm text-muted-foreground">All general inquiries, bug reports, and feedback</p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="mailto:support@englishtypingtest.org"
                className="inline-block font-mono text-xl font-semibold text-primary underline hover:opacity-90"
              >
                support@englishtypingtest.org
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Typical response time: 24 to 48 business hours</span>
            </div>
          </Card>

          {/* Departmental breakdown */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">How to Direct Your Inquiry</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5 border-border/60 bg-surface/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Bug className="h-5 w-5 text-amber-500" /> Technical &amp; Calculation Issues
                </div>
                <p className="text-sm">
                  Discovered an unexpected Net WPM score, timer glitch, or browser layout issue? Use our dedicated{" "}
                  <Link to="/report-error" className="text-primary underline font-medium">
                    Error Reporting Form
                  </Link>{" "}
                  for expedited triage.
                </p>
              </Card>

              <Card className="p-5 border-border/60 bg-surface/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" /> Privacy &amp; Data Requests
                </div>
                <p className="text-sm">
                  To request account deletion, data export, or inquire about our privacy architecture, email us with
                  subject <code className="text-xs bg-surface/60 px-1 py-0.5 rounded">[Privacy Request]</code>.
                </p>
              </Card>

              <Card className="p-5 border-border/60 bg-surface/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Copyright className="h-5 w-5 text-blue-500" /> Copyright &amp; DMCA Notices
                </div>
                <p className="text-sm">
                  For intellectual property inquiries, attribution corrections, or licensing questions, please contact{" "}
                  <a href="mailto:support@englishtypingtest.org?subject=DMCA%20Inquiry" className="text-primary underline">
                    support@englishtypingtest.org
                  </a>{" "}
                  with full passage details.
                </p>
              </Card>

              <Card className="p-5 border-border/60 bg-surface/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <MessageSquare className="h-5 w-5 text-violet-500" /> Educational Feedback &amp; Ideas
                </div>
                <p className="text-sm">
                  Suggestions for new exam formats, paragraph corpora, or keyboard layouts? We review all feedback to
                  guide our open roadmap.
                </p>
              </Card>
            </div>
          </section>

          {/* Operator Transparency Statement */}
          <section className="rounded-xl border border-border/80 bg-surface/10 p-6 space-y-3 text-sm">
            <h3 className="text-base font-bold text-foreground">Operating Transparency Note</h3>
            <p>
              EnglishTypingTest.org is an independent online web platform operated digitally. In adherence to our
              truthfulness policies, we do not list fictitious corporate office suites, non-existent call centers, or
              third-party telephone answering services. All communications are handled directly by our engineering and
              support staff via email.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
