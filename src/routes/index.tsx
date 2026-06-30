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
  Zap,
  LineChart,
  Clock,
  Play,
  Calculator,
  BookOpen,
  HelpCircle,
  Swords,
  Gamepad2,
  Globe,
  Upload,
  LayoutGrid,
  GraduationCap,
  Medal,
  Crown,
  ChevronRight,
  Star,
} from "lucide-react";

const LEADERBOARD_DATA = [
  { rank: 1, name: "shadow_keys", country: "JP", wpm: 187, accuracy: 99.1, badge: "crown" },
  { rank: 2, name: "velocirapter", country: "US", wpm: 172, accuracy: 98.6, badge: "gold" },
  { rank: 3, name: "key_wizard_in", country: "IN", wpm: 164, accuracy: 97.9, badge: "silver" },
  { rank: 4, name: "pixel_typer", country: "DE", wpm: 158, accuracy: 98.2, badge: "bronze" },
  { rank: 5, name: "swift_fingers", country: "BR", wpm: 151, accuracy: 96.8, badge: "none" },
  { rank: 6, name: "qwerty_ninja", country: "KR", wpm: 147, accuracy: 97.4, badge: "none" },
  { rank: 7, name: "type_storm", country: "FR", wpm: 143, accuracy: 96.1, badge: "none" },
];
const FLAG_MAP: Record<string, string> = {
  JP: "🇯🇵", US: "🇺🇸", IN: "🇮🇳", DE: "🇩🇪", BR: "🇧🇷", KR: "🇰🇷", FR: "🇫🇷",
};
const LANG_BADGES = ["EN", "हि", "मर", "ES", "FR", "DE", "日", "中", "AR", "+34"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "English Typing Test — Free WPM & Speed Tracker | EnglishtypingTest.org" },
      {
        name: "description",
        content:
          "Take the ultimate free English typing test online. Track WPM, accuracy, and CPM in real-time. Practice in any language, race globally, and improve with detailed analytics. No signup needed.",
      },
      { property: "og:title", content: "English Typing Test — Free WPM & Speed Tracker" },
      {
        property: "og:description",
        content:
          "Free typing tests with real-time WPM, accuracy, CPM tracking. Multi-language support, multiplayer races, arcade games, and detailed analytics.",
      },
      { property: "og:url", content: "https://englishtypingtest.org/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "English Typing Test — Free WPM & Speed Tracker" },
      {
        name: "twitter:description",
        content: "Free typing tests with real-time WPM, accuracy, and CPM tracking. Multi-language, multiplayer, gamified.",
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

  const fetchList = useServerFn(listEnabledDurations);
  const { data: durationItems } = useQuery({
    queryKey: ["public-durations"],
    queryFn: () => fetchList(),
  });
  const items = durationItems ?? [];
  const _rawArticles = t("seoBlock.articles", { returnObjects: true });
  const seoArticles: Array<{ title: string; body: string }> = Array.isArray(_rawArticles) ? _rawArticles : [];


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

        {/* ── HERO SECTION ─────────────────────────────────── */}
        <section aria-label="Hero — Start English Typing Test" className="relative overflow-hidden px-4 pt-20 pb-24 md:px-6 md:pt-28 md:pb-32">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-60 right-0 -z-10 h-[300px] w-[400px] rounded-full bg-accent/8 blur-[100px]" />

          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="mx-auto max-w-5xl text-center">
            <motion.div variants={fadeUp} className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-muted-foreground glass">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              {t("badge")}
            </motion.div>

            <motion.h1 variants={fadeUp} className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl lg:text-[5.5rem]">
              {t("hero.titleA")}{" "}
              <span className="text-gradient drop-shadow-sm">{t("hero.titleB")}</span>
              <br />
              <span className="text-foreground/70 text-4xl md:text-5xl lg:text-6xl">{t("hero.titleC")}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-balance text-lg md:text-xl text-muted-foreground">
              {t("hero.subtitle")}
            </motion.p>

            {/* Language badges */}
            <motion.div variants={fadeUp} className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {LANG_BADGES.map((lang) => (
                <span key={lang} className="rounded-full border border-border bg-surface/70 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground glass hover:border-primary/50 hover:text-primary transition-colors cursor-default">
                  {lang}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 text-base px-7 py-6 cursor-pointer">
                <Link to="/test">{t("hero.ctaStart")} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-7 py-6 cursor-pointer">
                <Link to="/auth" search={{ mode: "signup" }}>{t("hero.ctaSignup")}</Link>
              </Button>
            </motion.div>

            {/* Enhanced Glassmorphism Typing Mockup — with language dropdown + upload */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as const }}
              className="mx-auto mt-14 max-w-4xl rounded-2xl border border-border/80 bg-surface/40 p-6 text-left font-mono shadow-elegant glass md:p-8"
            >
              <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 font-sans text-primary font-semibold">
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" /> Live Engine Active
                  </span>
                  <span className="flex items-center gap-1 rounded-lg border border-border bg-surface/80 px-2.5 py-1 font-sans text-foreground cursor-pointer hover:border-primary/50 transition-colors">
                    <Globe className="h-3 w-3 text-primary" /> English ▾
                  </span>
                  <span className="flex items-center gap-1 rounded-lg border border-border bg-surface/80 px-2.5 py-1 font-sans text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-3 w-3" /> Upload .txt
                  </span>
                  <span className="font-sans text-muted-foreground hidden sm:block">● 60 Seconds</span>
                </div>
                <div className="flex gap-1">
                  <span className="h-3.5 w-3.5 rounded-full bg-red-500/30 border border-red-500/20" />
                  <span className="h-3.5 w-3.5 rounded-full bg-yellow-500/30 border border-yellow-500/20" />
                  <span className="h-3.5 w-3.5 rounded-full bg-green-500/30 border border-green-500/20" />
                </div>
              </div>
              <p className="text-2xl leading-relaxed tracking-wide md:text-3xl">
                <span className="text-typing-correct">the quick brown </span>
                <span className="text-typing-incorrect underline decoration-typing-incorrect/60 decoration-2">fox</span>
                <span className="relative inline-block w-[2px] h-[1.25em] align-middle bg-typing-caret animate-caret mx-[1px]" />
                <span className="text-typing-untyped">{" "}jumps over the lazy dog and runs through the beautiful meadow</span>
              </p>
              <div className="mt-8 flex flex-wrap items-baseline gap-8 border-t border-border/50 pt-6 font-sans text-sm text-muted-foreground">
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-extrabold text-primary font-display tabular-nums">78</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 mt-1">WPM (Speed)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-extrabold text-foreground font-display tabular-nums">97.4%</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 mt-1">Accuracy</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-extrabold text-foreground font-display tabular-nums">386</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/80 mt-1">CPM (Chars)</span>
                </div>
                <div className="flex flex-col ml-auto">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-secondary text-secondary-foreground border border-border">Touch Typing Mode</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── SOCIAL PROOF BAR ─────────────────────────────── */}
        <section aria-label="Platform statistics" className="border-y border-border/50 bg-surface/30 py-8 px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {([
                { value: t("stats.tests"), label: t("stats.testsLabel"), Icon: Zap },
                { value: t("stats.rating"), label: t("stats.ratingLabel"), Icon: Star },
                { value: t("stats.countries"), label: t("stats.countriesLabel"), Icon: Globe },
                { value: t("stats.signup"), label: t("stats.signupLabel"), Icon: Sparkles },
              ] as const).map(({ value, label, Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="h-4 w-4 text-primary mb-1" />
                  <span className="font-display text-3xl font-extrabold text-gradient tabular-nums">{value}</span>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUICK LAUNCH TYPING TESTS ─────────────────────── */}
        {items.length > 0 && (
          <section aria-label="Quick-launch typing test durations" className="border-t border-border/50 bg-background py-16 px-4 md:px-6">
            <div className="mx-auto max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  Start Your English Typing Test in Seconds
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Choose a predefined test duration. Each one has its own global leaderboard and WPM analytics.
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
                    View All Test Durations ({items.length}) <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ── CORE FEATURES 8-CARD GRID ────────────────────── */}
        <section aria-label="Core platform features" className="border-t border-border/50 bg-surface/5 px-4 py-20 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t("features.heading")}</h2>
              <p className="mt-3 text-muted-foreground">{t("features.subheading")}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard icon={Globe} title={t("features.multilang.title")} desc={t("features.multilang.desc")} linkTo="/test" accent="from-violet-500/20 to-purple-500/10" iconColor="text-violet-400" />
              <FeatureCard icon={Gauge} title={t("features.engine.title")} desc={t("features.engine.desc")} linkTo="/test" accent="from-primary/20 to-primary/5" iconColor="text-primary" />
              <FeatureCard icon={LineChart} title={t("features.chart.title")} desc={t("features.chart.desc")} linkTo="/test" accent="from-cyan-500/20 to-blue-500/10" iconColor="text-cyan-400" />
              <FeatureCard icon={Swords} title={t("features.race.title")} desc={t("features.race.desc")} linkTo="/race" accent="from-red-500/20 to-orange-500/10" iconColor="text-red-400" />
              <FeatureCard icon={Gamepad2} title={t("features.games.title")} desc={t("features.games.desc")} linkTo="/games" accent="from-green-500/20 to-emerald-500/10" iconColor="text-green-400" />
              <FeatureCard icon={LayoutGrid} title={t("features.templates.title")} desc={t("features.templates.desc")} linkTo="/templates" accent="from-amber-500/20 to-yellow-500/10" iconColor="text-amber-400" />
              <FeatureCard icon={Calculator} title={t("features.calculator.title")} desc={t("features.calculator.desc")} linkTo="/" accent="from-pink-500/20 to-rose-500/10" iconColor="text-pink-400" />
              <FeatureCard icon={GraduationCap} title={t("features.lessons.title")} desc={t("features.lessons.desc")} linkTo="/lessons" accent="from-indigo-500/20 to-blue-500/10" iconColor="text-indigo-400" />
            </div>
          </div>
        </section>

        {/* ── SEO CONTENT BLOCK — 3 rich-text articles ──────── */}
        <section aria-label="How the English Typing Test works" className="border-t border-border/50 bg-background px-4 py-20 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-4"><BookOpen className="h-5 w-5" /></div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t("seoBlock.heading")}</h2>
              <p className="mt-3 text-muted-foreground">{t("seoBlock.subheading")}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {seoArticles.map((article, i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-border/80 bg-surface/30 p-6 glass hover:border-primary/30 transition-colors"
                >
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3 leading-snug">{article.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{article.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── GAMIFIED LEADERBOARD PREVIEW ─────────────────── */}
        <section aria-label="Global typing leaderboard preview" className="border-t border-border/50 bg-surface/10 px-4 py-20 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-4"><Trophy className="h-5 w-5" /></div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t("leaderboard.heading")}</h2>
              <p className="mt-3 text-muted-foreground">{t("leaderboard.subheading")}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-surface/40 overflow-hidden glass shadow-elegant">
              <div className="grid grid-cols-[2.5rem_1fr_auto_auto] items-center gap-4 border-b border-border/50 bg-secondary/30 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>#</span><span>Typist</span><span className="text-right hidden sm:block">WPM</span><span className="text-right">Acc.</span>
              </div>
              {LEADERBOARD_DATA.map((entry, i) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`grid grid-cols-[2.5rem_1fr_auto_auto] items-center gap-4 px-5 py-3.5 border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors ${i === 0 ? "bg-amber-500/5" : ""}`}
                >
                  <div className="flex items-center justify-center">
                    {entry.badge === "crown" && <Crown className="h-5 w-5 text-amber-400" />}
                    {entry.badge === "gold" && <Medal className="h-5 w-5 text-amber-500" />}
                    {entry.badge === "silver" && <Medal className="h-5 w-5 text-slate-400" />}
                    {entry.badge === "bronze" && <Medal className="h-5 w-5 text-orange-600" />}
                    {entry.badge === "none" && <span className="text-sm font-bold text-muted-foreground font-mono">{entry.rank}</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{FLAG_MAP[entry.country]}</span>
                      <span className={`font-semibold text-sm truncate ${i === 0 ? "text-amber-400" : "text-foreground"}`}>{entry.name}</span>
                      {i === 0 && <span className="hidden sm:inline-flex rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-500 uppercase tracking-wider">#1 Global</span>}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(entry.wpm / 200) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                        className={`h-full rounded-full ${i === 0 ? "bg-gradient-to-r from-amber-400 to-amber-300" : "bg-primary/60"}`}
                      />
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className={`font-display text-lg font-bold tabular-nums ${i === 0 ? "text-amber-400" : "text-foreground"}`}>{entry.wpm}</span>
                    <span className="text-xs text-muted-foreground"> wpm</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-emerald-500 font-mono">{entry.accuracy}%</span>
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-border/50 bg-secondary/10 px-5 py-4 text-center">
                <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                  <Link to="/leaderboard">{t("leaderboard.ctaBtn")} <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── WPM RANK CALCULATOR ───────────────────────────── */}
        <section aria-label="Interactive WPM rank calculator" className="border-t border-border/50 bg-surface/10 py-20 px-4 md:px-6">
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
                  {(Array.isArray(t("wpmTiersTable.rows", { returnObjects: true }))
                    ? (t("wpmTiersTable.rows", { returnObjects: true }) as Array<{ wpm: string; category: string; percentile: string; description: string }>)
                    : []
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
                  {(Array.isArray(t("howItWorks.tips", { returnObjects: true }))
                    ? (t("howItWorks.tips", { returnObjects: true }) as string[])
                    : []
                  ).map(
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
              {(Array.isArray(t("faq.items", { returnObjects: true }))
                ? (t("faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>)
                : []
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

        {/* ── FINAL CTA ─────────────────────────────────────── */}
        <section aria-label="Final call to action" className="px-4 py-20 md:px-6 md:py-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl rounded-3xl border border-border bg-surface/40 p-10 text-center glass shadow-glow md:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.68_0.22_290/0.15),transparent_70%)]" />
            <Zap className="mx-auto h-12 w-12 text-primary animate-pulse" />
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-5xl">{t("cta.title")}</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base md:text-lg">{t("cta.desc")}</p>
            <Button asChild size="lg" className="mt-8 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 text-base px-8 py-6 cursor-pointer">
              <Link to="/test">{t("cta.button")} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </section>

      </main>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  linkTo,
  accent,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  linkTo: string;
  accent: string;
  iconColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border/80 bg-surface/30 p-5 glass transition-all duration-300 hover:border-primary/40 hover:shadow-glow hover:-translate-y-0.5 group flex flex-col justify-between"
    >
      <div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${accent} transition-all duration-300 group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <h3 className="mt-4 font-display text-base font-bold text-foreground leading-snug">{title}</h3>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-end text-xs">
        <Link to={linkTo as any} className="flex items-center text-primary font-medium group-hover:underline">
          Explore <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
