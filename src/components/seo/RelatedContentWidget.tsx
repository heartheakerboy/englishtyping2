import React from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Gamepad2, Keyboard, Calculator, Sparkles } from "lucide-react";

interface RelatedItem {
  label: string;
  to: string;
  desc?: string;
}

const GAMES_LIST: RelatedItem[] = [
  { label: "Memory Sequence Game", to: "/games/memory", desc: "Simon-style color recall drill" },
  { label: "Reaction Time Test", to: "/games/reaction", desc: "Test click reflexes in milliseconds" },
  { label: "CPS Clicks Test", to: "/games/cps", desc: "Clicks per second speed test" },
  { label: "Spacebar Speed Test", to: "/games/spacebar", desc: "Mashing speed timer challenge" },
  { label: "Keyboard Trainer", to: "/games/trainer", desc: "Drill specific row structures" },
  { label: "Type Racer (Race Bots)", to: "/games/race-bots", desc: "Typing sprint against AI bots" },
];

const TESTS_LIST: RelatedItem[] = [
  { label: "Standard Typing Test", to: "/typing-test", desc: "Measure WPM and accuracy" },
  { label: "Type Sprints (1 Minute)", to: "/typing-test/1-minute", desc: "Quick 60-second speed test" },
  { label: "Type Sprints (3 Minute)", to: "/typing-test/3-minute", desc: "Moderate 180-second sprint" },
  { label: "Type Sprints (5 Minute)", to: "/typing-test/5-minute", desc: "Long-form 300-second test" },
];

const TOOLS_LIST: RelatedItem[] = [
  { label: "Typing Leaderboards", to: "/leaderboard", desc: "Compete with global typists" },
];

export function RelatedContentWidget() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  // Filter out the current page from being displayed inside related lists
  const relatedGames = React.useMemo(() => {
    return GAMES_LIST.filter((g) => g.to !== currentPath).slice(0, 3);
  }, [currentPath]);

  const relatedTests = React.useMemo(() => {
    return TESTS_LIST.filter((t) => t.to !== currentPath).slice(0, 2);
  }, [currentPath]);

  return (
    <div className="mt-16 pt-10 border-t border-border/40 space-y-8">
      <h3 className="font-display text-xl font-bold tracking-tight">Recommended Practice & Tools</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Related Games */}
        <Card className="border-border/50 bg-surface/10 p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Gamepad2 className="h-4 w-4" />
            <h4 className="font-display font-semibold text-sm">Mini Games</h4>
          </div>
          <ul className="space-y-3">
            {relatedGames.map((g) => (
              <li key={g.to}>
                <Link to={g.to} className="group block">
                  <span className="text-sm font-medium text-foreground hover:text-primary transition-colors block">
                    {g.label}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{g.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Related Tests */}
        <Card className="border-border/50 bg-surface/10 p-5 space-y-4">
          <div className="flex items-center gap-2 text-success">
            <Keyboard className="h-4 w-4" />
            <h4 className="font-display font-semibold text-sm">Typing Tests</h4>
          </div>
          <ul className="space-y-3">
            {relatedTests.map((t) => (
              <li key={t.to}>
                <Link to={t.to} className="group block">
                  <span className="text-sm font-medium text-foreground hover:text-success transition-colors block">
                    {t.label}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{t.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Calculators & Utilities */}
        <Card className="border-border/50 bg-surface/10 p-5 space-y-4">
          <div className="flex items-center gap-2 text-warning">
            <Calculator className="h-4 w-4" />
            <h4 className="font-display font-semibold text-sm">Calculators & Stats</h4>
          </div>
          <ul className="space-y-3">
            {TOOLS_LIST.map((tool) => (
              <li key={tool.to}>
                <Link to={tool.to} className="group block">
                  <span className="text-sm font-medium text-foreground hover:text-warning transition-colors block">
                    {tool.label}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{tool.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
