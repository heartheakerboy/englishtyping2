import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Image as ImageIcon, Code2, Gauge, Server, FileCode } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/seo")({ component: SEOPage });

const ITEMS = [
  {
    icon: FileCode,
    title: "Meta titles & descriptions",
    status: "Per-route head() — generated for every page including blog posts.",
  },
  {
    icon: ImageIcon,
    title: "Open Graph & Twitter cards",
    status: "OG type, image, and twitter:card configured at root + leaf routes.",
  },
  {
    icon: Code2,
    title: "JSON-LD schema",
    status: "Article schema emitted on blog posts; Organization on root.",
  },
  {
    icon: Server,
    title: "Sitemap & robots",
    status: "Dynamic /sitemap.xml includes blog posts; /robots.txt allows all.",
  },
  {
    icon: Gauge,
    title: "Canonical URLs & breadcrumbs",
    status: "Canonical links on leaf routes; breadcrumb trail on blog.",
  },
  {
    icon: Gauge,
    title: "Core Web Vitals",
    status: "SSR enabled, code-splitting per route, image lazy-loading, font preconnect.",
  },
];

function SEOPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">SEO</h1>
        <p className="text-sm text-muted-foreground">Auto-generated SEO across the site.</p>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ITEMS.map((i) => (
          <Card key={i.title} className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <i.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {i.title}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{i.status}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h2 className="text-sm font-medium">Performance</h2>
        <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
          <li>Server-side rendering via TanStack Start on the edge runtime.</li>
          <li>Route-level code splitting — only the visited route's JS is downloaded.</li>
          <li>Image lazy-loading with native loading="lazy".</li>
          <li>HTTP caching: sitemap cached 1 hour; static assets fingerprinted and immutable.</li>
          <li>Recharts and heavy components rendered on demand inside their routes.</li>
        </ul>
      </Card>
    </div>
  );
}
