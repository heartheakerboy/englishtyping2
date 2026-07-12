import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getSiteSitemap } from "@/lib/linking-system.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Keyboard, Gamepad2, Calculator, BookOpen, Scale, Home } from "lucide-react";

export const Route = createFileRoute("/sitemap")({
  component: SitemapPage,
  head: () => ({
    meta: [
      { title: "HTML Sitemap — English Typing Test" },
      {
        name: "description",
        content: "Explore the complete directory of typing tests, games, articles, calculators, and tutorials.",
      },
    ],
    links: [{ rel: "canonical", href: "/sitemap" }],
  }),
});

function SitemapPage() {
  const fetchSitemap = useServerFn(getSiteSitemap);
  const { data: pages, isLoading } = useQuery({
    queryKey: ["site-sitemap"],
    queryFn: () => fetchSitemap(),
  });

  const categorized = useMemo(() => {
    const list = pages ?? [];
    const groups = {
      core: [] as typeof list,
      tests: [] as typeof list,
      games: [] as typeof list,
      calculators: [] as typeof list,
      blogs: [] as typeof list,
      legal: [] as typeof list,
    };

    list.forEach((page) => {
      if (page.path === "/" || page.path === "/typing-test" || page.path === "/games" || page.path === "/blog" || page.path === "/leaderboard") {
        groups.core.push(page);
      } else if (page.path.startsWith("/typing-test/")) {
        groups.tests.push(page);
      } else if (page.path.startsWith("/games/")) {
        groups.games.push(page);
      } else if (page.path.startsWith("/calculators/")) {
        groups.calculators.push(page);
      } else if (page.path.startsWith("/blog/")) {
        groups.blogs.push(page);
      } else if (page.path.startsWith("/legal/")) {
        groups.legal.push(page);
      }
    });

    return groups;
  }, [pages]);

  function Section({ title, icon: Icon, items, colorClass }: { title: string; icon: any; items: any[]; colorClass: string }) {
    if (items.length === 0) return null;
    return (
      <Card className="p-6 border-border/50 bg-surface/20 space-y-4 hover:border-border transition-colors">
        <h2 className={`font-display text-base font-bold flex items-center gap-2 ${colorClass}`}>
          <Icon className="h-5 w-5" />
          {title}
        </h2>
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors block"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Sitemap Directory</h1>
          <p className="text-sm text-muted-foreground">
            Browse through all categories of tests, rows practices, typing games, calculators, and detailed guides.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-10">Compiling directory...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Section title="Main Hubs" icon={Home} items={categorized.core} colorClass="text-primary" />
            <Section title="Typing Sprint Tests" icon={Keyboard} items={categorized.tests} colorClass="text-success" />
            <Section title="Mini Games" icon={Gamepad2} items={categorized.games} colorClass="text-info" />
            <Section title="Calculators & Stats" icon={Calculator} items={categorized.calculators} colorClass="text-warning" />
            <Section title="Blog deep-dives" icon={BookOpen} items={categorized.blogs} colorClass="text-danger" />
            <Section title="Legal & Policy" icon={Scale} items={categorized.legal} colorClass="text-muted-foreground" />
          </div>
        )}
      </main>
    </div>
  );
}

import { useMemo } from "react";
