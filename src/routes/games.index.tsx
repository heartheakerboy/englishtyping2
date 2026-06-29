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
        <div className="flex items-end justify-between gap-4">
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
      </main>
    </div>
  );
}
