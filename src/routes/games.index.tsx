import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listActiveGames } from "@/lib/games.functions";
import {
  Zap,
  MousePointerClick,
  Space,
  Brain,
  Keyboard,
  Car,
  Skull,
  CloudHail,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SmartLink } from "@/components/ui/SmartLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Typing Games — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Arcade typing games: Falling Words, Zombie Typing, Balloon Burst plus reaction time, CPS, spacebar, memory and keyboard trainer.",
      },
      { property: "og:title", content: "Typing Games — Arcade & Mini Games" },
      {
        property: "og:description",
        content:
          "Earn XP and coins playing premium arcade typing games and compete on global leaderboards.",
      },
      { property: "og:url", content: "/games" },
    ],
    links: [{ rel: "canonical", href: "/games" }],
  }),
  component: GamesIndex,
});

// Visual presets for the arcade entries we ship with code routes.
const ARCADE_PRESETS: Record<string, { icon: any; gradient: string }> = {
  "falling-words": { icon: CloudHail, gradient: "from-sky-500/30 to-indigo-500/20" },
  "zombie-typing": { icon: Skull, gradient: "from-emerald-500/30 to-rose-500/20" },
  "balloon-burst": { icon: Sparkles, gradient: "from-amber-400/30 to-pink-500/20" },
};

const MINI = [
  { to: "/games/race-bots", icon: Car, key: "race" },
  { to: "/games/reaction", icon: Zap, key: "reaction" },
  { to: "/games/cps", icon: MousePointerClick, key: "cps" },
  { to: "/games/spacebar", icon: Space, key: "spacebar" },
  { to: "/games/memory", icon: Brain, key: "memory" },
  { to: "/games/trainer", icon: Keyboard, key: "trainer" },
] as const;

function GamesIndex() {
  const { t } = useTranslation("games");
  const q = useQuery({ queryKey: ["games-public"], queryFn: () => listActiveGames() });
  const arcade = (q.data ?? []).filter((g: any) => ARCADE_PRESETS[g.slug]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <Breadcrumbs />
        <div className="flex items-end justify-between gap-4 mt-4">
          <div>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">{t("page.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("page.subtitle")}</p>
          </div>
        </div>

        {/* Arcade */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">{t("page.arcade")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {arcade.length === 0 && q.isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-44 animate-pulse border-border/60 bg-surface/40" />
                ))
              : arcade.map((g: any) => {
                  const preset = ARCADE_PRESETS[g.slug];
                  const Icon = preset.icon;
                  return (
                    <Link key={g.id} to={`/games/${g.slug}` as any}>
                      <Card
                        className={`group relative h-full overflow-hidden border-border/60 bg-gradient-to-br ${preset.gradient} p-5 transition-all hover:border-primary/50 hover:shadow-glow`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="grid h-11 w-11 place-items-center rounded-lg bg-background/40 text-primary backdrop-blur">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex gap-1">
                            {g.is_featured && (
                              <Badge variant="secondary">{t("page.featured")}</Badge>
                            )}
                            <Badge variant="outline" className="capitalize">
                              {g.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <h3 className="mt-3 font-display text-lg font-semibold">{g.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {g.description}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{t("page.xp", { n: g.xp_reward })}</span>
                          <span>{t("page.coins", { n: g.coin_reward })}</span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
          </div>
        </section>

        {/* Mini games */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">{t("page.mini")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MINI.map((g) => (
              <Link key={g.to} to={g.to}>
                <Card className="group h-full border-border/60 bg-surface/40 p-5 backdrop-blur transition-all hover:border-primary/40 hover:shadow-glow">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary/15 text-primary">
                    <g.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold">
                    {t(`mini.${g.key}.name`)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`mini.${g.key}.desc`)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Informational Guide & FAQs */}
        <section className="mt-16 border-t border-border/40 pt-12 max-w-4xl space-y-12">
          {/* Guide content */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">The Science of Typing Games: Learning Touch Typing Through Play</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Learning how to type quickly and accurately doesn't have to be a repetitive, dry chore. By integrating 
              <strong> gamification</strong> principles, playing typing arcade games translates abstract key positioning 
              into automatic reflex loops. In cognitive psychology, this process is known as <strong>automaticity</strong>—the 
              ability to perform a complex motor task (like touch typing) without conscious thought. When you play a game, 
              your brain shifts focus from <em>"where is the G key?"</em> to <em>"how do I shoot that incoming zombie word?"</em>, 
              forcing your fingers to resolve coordinates via pure muscle memory.
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              To gain a baseline measure of your speed before diving into games, we recommend starting with a standard 
              <SmartLink href="/typing-test" className="text-primary hover:underline font-semibold">free online typing test</SmartLink> to 
              calculate your baseline Words Per Minute (WPM) and accuracy.
            </p>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-primary">
                  <CloudHail className="h-5 w-5" />
                  Arcade Games: Speed and Tactical Focus
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In <strong>Falling Words</strong>, descending blocks force your eyes to track vertically while your fingers type 
                  without looking. In <strong>Zombie Typing</strong>, you face target prioritization decisions: finishing immediate 
                  threats or starting on long-form terms. <strong>Balloon Burst</strong> targets letter recognition drills to build 
                  row coordination before paragraph sprints.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-success">
                  <Car className="h-5 w-5" />
                  Mini-Games: Reflex and Endurance
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Once coordinates are clear, the <SmartLink href="/games/race-bots" className="text-primary hover:underline">type racing bots game</SmartLink> offers 
                  competitive sentence sprint pacing. Reflex speed is sharpened with the <SmartLink href="/games/reaction" className="text-primary hover:underline">reaction time reflex drill</SmartLink>, 
                  while physical click endurance can be measured via the <SmartLink href="/games/cps" className="text-primary hover:underline">clicks per second speed test</SmartLink> and 
                  mashing-based <SmartLink href="/games/spacebar" className="text-primary hover:underline">spacebar counter test</SmartLink>.
                </p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              For targeted finger drill configurations, the <SmartLink href="/games/trainer" className="text-primary hover:underline font-semibold">virtual keyboard typing trainer</SmartLink> lets 
              you isolate specific key rows. Combining these drills with cognitive sequencing in the <SmartLink href="/games/memory" className="text-primary hover:underline font-semibold">color pattern recall trainer</SmartLink> will 
              keep your brain engaged and prevent typing fatigue.
            </p>
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  Can playing typing games actually increase my WPM?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Yes, typing games help you transition from visual typing (hunting for keys) to kinesthetic typing (automatic reflex). By introducing target deadlines, your brain is forced to rely on muscle memory, increasing speed over time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  What is the difference between arcade typing and mini games?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Arcade games (like Falling Words) focus on typing descending lists or survival-based target defense. Mini-games target specific diagnostics, such as your raw reflex speed, finger clicks per second, row targeting, or sequence recall.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  How often should I practice typing with games?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  We recommend a balanced split: spend 15 minutes on structured typing tests and trainer drills, followed by 10 minutes of arcade games to test your speed under pressure and keep practice fun.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  What is a good target accuracy for typing games?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  You should aim for at least 95% accuracy. In racing games or target shooters, errors slow down your vehicle or target alignment, meaning accuracy remains the most vital metric for speed.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
    </div>
  );
}
