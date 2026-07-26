import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Newspaper, FileText, Mail, Ticket, Tag, Globe, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cms")({ component: CMSHub });

const CMS_SECTIONS = [
  {
    title: "Blog",
    desc: "Markdown posts, categories, authors.",
    to: "/admin/blog" as const,
    icon: Newspaper,
    color: "text-blue-400 bg-blue-500/10",
  },
  {
    title: "Typing Texts",
    desc: "Curated passages across all languages.",
    to: "/admin/texts" as const,
    icon: FileText,
    color: "text-violet-400 bg-violet-500/10",
  },
  {
    title: "Newsletter",
    desc: "Subscriber list + CSV export.",
    to: "/admin/newsletter" as const,
    icon: Mail,
    color: "text-emerald-400 bg-emerald-500/10",
  },
  {
    title: "Coupons",
    desc: "Promo codes for premium upgrades.",
    to: "/admin/coupons" as const,
    icon: Ticket,
    color: "text-amber-400 bg-amber-500/10",
  },
  {
    title: "Categories",
    desc: "Practice category taxonomy.",
    to: "/admin/categories" as const,
    icon: Tag,
    color: "text-rose-400 bg-rose-500/10",
  },
  {
    title: "Languages",
    desc: "Supported languages and RTL flags.",
    to: "/admin/languages" as const,
    icon: Globe,
    color: "text-cyan-400 bg-cyan-500/10",
  },
];

function CMSHub() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">CMS</h1>
        <p className="text-sm text-muted-foreground">All editable content lives here.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CMS_SECTIONS.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.title} to={c.to} className="group block">
              <Card className="h-full flex flex-col justify-between border border-border/50 bg-surface/40 p-5 shadow-elegant backdrop-blur-sm hover:border-primary/40 hover:bg-surface-elevated/40 transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg p-2.5 ${c.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {c.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/10 text-[11px] font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Manage {c.title.toLowerCase()}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
