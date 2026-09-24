import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  FileText,
  Cookie,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Scale,
  Mail,
  Bug,
} from "lucide-react";

export const Route = createFileRoute("/legal/")({
  head: () => ({
    meta: [
      { title: "Legal & Compliance Center — EnglishTypingTest.org" },
      {
        name: "description",
        content:
          "Access all legal, privacy, terms, cookie, and compliance documents for EnglishTypingTest.org.",
      },
      { property: "og:title", content: "Legal & Compliance Center — EnglishTypingTest.org" },
      {
        property: "og:description",
        content:
          "Access all legal, privacy, terms, cookie, and compliance documents for EnglishTypingTest.org.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/legal" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/legal" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Legal & Compliance Center",
          url: "https://www.englishtypingtest.org/legal",
          description: "Legal policies, terms, and privacy documentation for EnglishTypingTest.org.",
          publisher: {
            "@type": "Organization",
            name: "English Typing Test",
            url: "https://www.englishtypingtest.org/",
          },
        }),
      },
    ],
  }),
  component: LegalHubPage,
});

function LegalHubPage() {
  const policies = [
    {
      title: "Privacy Policy",
      href: "/privacy",
      icon: ShieldCheck,
      color: "text-emerald-500",
      description:
        "Understand our zero-keystroke logging architecture, client-side processing, and complete data safety standards.",
    },
    {
      title: "Terms of Service",
      href: "/terms",
      icon: FileText,
      color: "text-blue-500",
      description:
        "Guidelines governing platform access, anti-cheat leaderboard integrity, and acceptable educational use.",
    },
    {
      title: "Cookie Policy",
      href: "/cookie-policy",
      icon: Cookie,
      color: "text-amber-500",
      description:
        "Disclosure of local storage keys (theme, language, high scores) and Google AdSense advertising cookies.",
    },
    {
      title: "Disclaimer",
      href: "/disclaimer",
      icon: AlertTriangle,
      color: "text-red-500",
      description:
        "Legal notice regarding non-affiliation with government agencies and hardware latency factors.",
    },
    {
      title: "Measurement Methodology",
      href: "/methodology",
      icon: Scale,
      color: "text-purple-500",
      description:
        "Mathematical rigor behind our Net WPM, Gross WPM, CPM, and 5-stroke word calculations.",
    },
    {
      title: "Editorial Policy",
      href: "/editorial-policy",
      icon: BookOpen,
      color: "text-sky-500",
      description:
        "Our journalistic standards, syllabus adherence, and factual verification processes.",
    },
    {
      title: "Report an Error",
      href: "/report-error",
      icon: Bug,
      color: "text-orange-500",
      description:
        "Submit calculation discrepancies, timer bugs, or typographical corrections directly to maintainers.",
    },
    {
      title: "Contact & Support",
      href: "/contact",
      icon: Mail,
      color: "text-primary",
      description:
        "Direct email contact information and typical response timelines for technical assistance.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Compliance &amp; Transparency Hub
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Legal &amp; Policy Center
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Welcome to the official legal and governance directory of EnglishTypingTest.org. All platform policies,
            terms, and disclosures are accessible below.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {policies.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.href} to={p.href} className="group">
                <Card className="h-full p-5 border-border/70 bg-surface/30 hover:bg-surface/60 transition-all duration-200 flex flex-col justify-between group-hover:border-primary/50 group-hover:shadow-sm">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-surface-elevated">
                        <Icon className={`h-5 w-5 ${p.color}`} />
                      </div>
                      <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {p.title}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">{p.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1 text-xs font-semibold text-primary">
                    <span>Read Policy</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
