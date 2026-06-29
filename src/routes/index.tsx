import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listEnabledDurations } from "@/lib/test-durations.functions";
import {
  ArrowRight,
  Gauge,
  Sparkles,
  Trophy,
  Keyboard,
  Zap,
  Brain,
  LineChart,
  Clock,
  Play,
  Calculator,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "English Typing Test — Measure your WPM & typing speed" },
      {
        name: "description",
        content:
          "Free, modern typing test platform. Track WPM, accuracy, and CPM in real time. Take a 1, 3, or 5-minute online typing test with detailed analytics and sitemaps.",
      },
      { property: "og:title", content: "English Typing Test — Measure WPM & Speed" },
      {
        property: "og:description",
        content:
          "Free typing tests with real-time WPM, accuracy, CPM tracking and detailed analysis charts.",
      },
      { property: "og:url", content: "https://englishtypingtest.org/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "English Typing Test — Measure WPM & Speed" },
      {
        name: "twitter:description",
        content: "Free typing tests with real-time WPM, accuracy, and CPM tracking.",
      },
    ],
    links: [{ rel: "canonical", href: "https://englishtypingtest.org/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "English Typing Test",
            url: "https://englishtypingtest.org/",
            description:
              "Free modern typing test platform with real-time WPM, accuracy and CPM tracking.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://englishtypingtest.org/blog?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "English Typing Test",
            url: "https://englishtypingtest.org/",
            logo: "https://englishtypingtest.org/favicon.ico",
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "English Typing Test",
            operatingSystem: "All",
            applicationCategory: "EducationalApplication",
            browserRequirements: "Requires HTML5/JavaScript",
            offers: {
              "@type": "Offer",
              price: "0.00",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "1847",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is a good typing speed?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "For most professional jobs (like writers, programmers, or office admins), a good typing speed is between 50 to 80 WPM. Anything above 80 WPM is considered highly fluent, while speeds over 100 WPM are elite.",
                },
              },
              {
                "@type": "Question",
                name: "How can I increase my WPM?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The best way to increase your typing speed is by learning touch typing. This means using all ten fingers and keeping your hands on the home row without looking down. Focus on typing accurately, and speed will follow naturally.",
                },
              },
              {
                "@type": "Question",
                name: "Does accuracy affect my WPM?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, accuracy is vital. While 'Raw WPM' measures how fast you physically hit keys, 'Net WPM' deducts penalties for mistakes. Practicing with high accuracy prevents you from spending extra time pressing backspace to correct errors.",
                },
              },
              {
                "@type": "Question",
                name: "How is WPM different from CPM?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "WPM stands for Words Per Minute, which counts a 'word' as 5 characters. CPM stands for Characters Per Minute, which measures the exact number of individual keystrokes (letters, numbers, spaces, and punctuation) you type in one minute.",
                },
              },
              {
                "@type": "Question",
                name: "Are typing tests free on this platform?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! All typing tests, lessons, multiplayer modes, and analytics charts on englishtypingtest.org are 100% free. You can practice without even creating an account, though an account helps track your historical stats.",
                },
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: LandingPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const } },
};

function LandingPage() {
  const { t } = useTranslation("home");
  const [wpm, setWpm] = useState(40);

  // Fetch active public test configurations
  const fetchList = useServerFn(listEnabledDurations);
  const { data: durationItems } = useQuery({
    queryKey: ["public-durations"],
    queryFn: () => fetchList(),
  });
  const items = durationItems ?? [];

  // Speed rank helper function based on WPM
  const getWpmCategory = (val: number) => {
    if (val < 30) {
      return {
        key: "slow",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
        percentile: "Bottom 15%",
      };
    }
    if (val <= 45) {
      return {
        key: "average",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        percentile: "Average 50%",
      };
    }
    if (val <= 65) {
      return {
        key: "aboveAverage",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        percentile: "Top 30%",
      };
    }
    if (val <= 85) {
      return {
        key: "pro",
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        percentile: "Top 10%",
      };
    }
    return {
      key: "god",
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
      percentile: "Top 1%",
    };
  };

  const activeCategory = getWpmCategory(wpm);

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main">
        {/* Cinematic Hero */}
        <section className="relative overflow-hidden px-4 pt-20 pb-24 md:px-6 md:pt-28 md:pb-32 bg-radial-gradient">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="mx-auto max-w-5xl text-center"
          >
            <motion.div
              variants={fadeUp}
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-muted-foreground glass"
            >
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              {t("badge")}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl"
            >
              {t("hero.titleA")}{" "}
              <span className="text-gradient drop-shadow-sm">{t("hero.titleB")}</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-balance text-lg md:text-xl text-muted-foreground"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 text-base px-6 py-6 cursor-pointer"
              >
                <Link to="/test">
                  {t("hero.ctaStart")} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base px-6 py-6 cursor-pointer"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("hero.ctaSignup")}
                </Link>
              </Button>
            </motion.div>

            {/* Live Interactive/Breathing Typing Console Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as const }}
              className="mx-auto mt-16 max-w-4xl rounded-2xl border border-border/80 bg-surface/40 p-6 text-left font-mono shadow-elegant glass md:p-8"
            >
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-sans text-primary font-semibold">
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                    Live Engine Active
                  </span>
                  <span className="font-sans text-muted-foreground">● English Mode</span>
                  <span className="font-sans text-muted-foreground">● 30 Seconds</span>
                </div>
                <div className="flex gap-1">
                  <span className="h-3.5 w-3.5 rounded-full bg-red-500/30 border border-red-500/20" />
                  <span className="h-3.5 w-3.5 rounded-full bg-yellow-500/30 border border-yellow-500/20" />
                  <span className="h-3.5 w-3.5 rounded-full bg-green-500/30 border border-green-500/20" />
                </div>
              </div>
              <p className="text-2xl leading-relaxed tracking-wide md:text-3xl">
                <span className="text-typing-correct">the quick brown </span>
                <span className="text-typing-incorrect underline decoration-typing-incorrect/60 decoration-2">
                  fox
                </span>
                <span className="relative inline-block w-[2px] h-[1.25em] align-middle bg-typing-caret animate-caret mx-[1px]" />
                <span className="text-typing-untyped">
                  {" "}
                  jumps over the lazy dog and runs through the beautiful meadow
                </span>
              </p>
              <div className="mt-8 flex flex-wrap items-baseline gap-8 border-t border-border/50 pt-6 font-sans text-sm text-muted-foreground">
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-extrabold text-primary font-display tabular-nums">
                    78
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 mt-1">
                    WPM (Speed)
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-extrabold text-foreground font-display tabular-nums">
                    97.4%
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 mt-1">
                    Accuracy
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-extrabold text-foreground font-display tabular-nums">
                    386
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 mt-1">
                    CPM (Chars)
                  </span>
                </div>
                <div className="flex flex-col ml-auto">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-secondary text-secondary-foreground border border-border">
                    Touch Typing Practice Mode
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Dynamic Typing Tests Quick-Launch Section (SEO Link Juice) */}
        {items.length > 0 && (
          <section className="border-t border-border/50 bg-background py-16 px-4 md:px-6">
            <div className="mx-auto max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  Take a Quick Typing Test
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Choose a predefined typing test duration to benchmark your writing speed. Each
                  duration features its own global leaderboard.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.slice(0, 6).map((d) => (
                  <Link
                    key={d.id}
                    to="/typing-test/$slug"
                    params={{ slug: d.slug }}
                    className="group"
                  >
                    <div className="h-full rounded-xl border border-border/80 bg-surface/40 p-5 glass transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-glow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="flex gap-1.5">
                            {d.featured && (
                              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-semibold text-amber-500 uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                            {d.popular && (
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-500 uppercase tracking-wider">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {d.nav_label}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {d.meta_description}
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {d.seconds ? `${d.seconds}s` : "Custom"} · {d.difficulty}
                        </span>
                        <span className="flex items-center text-primary font-medium group-hover:underline">
                          Start Test <Play className="ml-1 h-3 w-3 fill-primary" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button asChild variant="outline">
                  <Link to="/typing-test">
                    View All Durations ({items.length}) <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Interactive Speed Rank Estimator (Increases dwell time & interaction) */}
        <section className="border-t border-border/50 bg-surface/10 py-20 px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t("speedEstimator.heading")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-sm md:text-base">
              {t("speedEstimator.subheading")}
            </p>

            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border/80 bg-surface/30 p-6 glass text-left md:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {t("speedEstimator.wpmLabel")}
                </span>
                <span className="text-4xl font-extrabold font-mono text-primary tabular-nums">
                  {wpm} WPM
                </span>
              </div>

              <Slider
                value={[wpm]}
                onValueChange={(val) => setWpm(val[0])}
                min={10}
                max={150}
                step={1}
                className="my-8 cursor-pointer"
              />

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${activeCategory.color}`}
                >
                  {t(`speedEstimator.tiers.${activeCategory.key}.title`)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground font-mono">
                  Percentile: {activeCategory.percentile}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t(`speedEstimator.tiers.${activeCategory.key}.desc`)}
              </p>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="border-t border-border/50 bg-background px-4 py-20 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("features.heading")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("features.subheading")}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Feature
                icon={Gauge}
                title={t("features.engine.title")}
                desc={t("features.engine.desc")}
              />
              <Feature
                icon={LineChart}
                title={t("features.chart.title")}
                desc={t("features.chart.desc")}
              />
              <Feature
                icon={Keyboard}
                title={t("features.modes.title")}
                desc={t("features.modes.desc")}
              />
              <Feature
                icon={Trophy}
                title={t("features.dashboard.title")}
                desc={t("features.dashboard.desc")}
              />
              <Feature
                icon={Brain}
                title={t("features.mistakes.title")}
                desc={t("features.mistakes.desc")}
              />
              <Feature
                icon={Sparkles}
                title={t("features.ai.title")}
                desc={t("features.ai.desc")}
              />
            </div>
          </div>
        </section>

        {/* WPM Reference Table (SEO Rich Text Content) */}
        <section className="border-t border-border/50 bg-surface/5 py-20 px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("wpmTiersTable.heading")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("wpmTiersTable.subheading")}</p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface/40 overflow-hidden glass shadow-elegant">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow>
                    <TableHead className="font-bold text-foreground py-4 px-6">
                      {t("wpmTiersTable.cols.wpm")}
                    </TableHead>
                    <TableHead className="font-bold text-foreground py-4 px-4">
                      {t("wpmTiersTable.cols.category")}
                    </TableHead>
                    <TableHead className="font-bold text-foreground py-4 px-4">
                      {t("wpmTiersTable.cols.percentile")}
                    </TableHead>
                    <TableHead className="font-bold text-foreground py-4 px-6">
                      {t("wpmTiersTable.cols.description")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(
                    (t("wpmTiersTable.rows", {
                      returnObjects: true,
                    }) as Array<{
                      wpm: string;
                      category: string;
                      percentile: string;
                      description: string;
                    }>) || []
                  ).map((row, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-primary/5 transition-colors border-b border-border/40 last:border-b-0"
                    >
                      <TableCell className="font-bold font-mono py-4 px-6 text-primary">
                        {row.wpm}
                      </TableCell>
                      <TableCell className="font-medium py-4 px-4">{row.category}</TableCell>
                      <TableCell className="font-mono text-xs py-4 px-4">
                        {row.percentile}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm py-4 px-6">
                        {row.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* WPM Calculation & Guidelines Guide (SEO Rich Text Content) */}
        <section className="border-t border-border/50 bg-background py-20 px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl font-bold text-center mb-12 tracking-tight md:text-4xl">
              {t("howItWorks.heading")}
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface/30 p-6 glass">
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-primary" />
                  {t("howItWorks.formulaTitle")}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {t("howItWorks.formulaDesc")}
                </p>
                <div className="bg-secondary/60 rounded-xl p-4 text-center font-mono border border-border/80 text-sm font-semibold tracking-wide text-primary">
                  {t("howItWorks.formulaText")}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mt-4">
                  {t("howItWorks.accuracyDesc")}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface/30 p-6 glass">
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary animate-pulse" />
                  {t("howItWorks.tipsTitle")}
                </h3>
                <ul className="space-y-3">
                  {((t("howItWorks.tips", { returnObjects: true }) as string[]) || []).map(
                    (tip, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary font-mono">
                          {i + 1}
                        </span>
                        <span className="leading-normal">{tip}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Collapsible FAQ Section (Google Schema SEO Target) */}
        <section className="border-t border-border/50 bg-surface/5 py-20 px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("faq.heading")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("faq.subheading")}</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {(
                (t("faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>) || []
              ).map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="rounded-xl border border-border bg-surface/40 px-5 glass transition-all duration-300 data-[state=open]:border-primary/50"
                >
                  <AccordionTrigger className="text-base font-bold text-foreground py-4 hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Premium CTA Box */}
        <section className="px-4 py-20 md:px-6 md:py-28 bg-gradient-radial">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl rounded-3xl border border-border bg-surface/40 p-10 text-center glass shadow-glow md:p-16"
          >
            <Zap className="mx-auto h-12 w-12 text-primary animate-pulse" />
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
              {t("cta.desc")}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 text-base px-6 py-6 cursor-pointer"
            >
              <Link to="/test">
                {t("cta.button")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border/80 bg-surface/30 p-6 glass transition-all duration-300 hover:border-primary/50 hover:shadow-glow hover:-translate-y-0.5 group"
    >
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}
