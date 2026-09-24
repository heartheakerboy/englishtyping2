import { createFileRoute, notFound, redirect, Link } from "@tanstack/react-router";
import { getLegalPage } from "@/lib/footer.functions";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ShieldCheck, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/legal/$slug")({
  loader: async ({ params }) => {
    const slug = (params.slug || "").toLowerCase().trim();

    // Canonical redirect mappings
    if (slug === "privacy" || slug === "privacy-policy") {
      throw redirect({ to: "/privacy", statusCode: 301 });
    }
    if (slug === "terms" || slug === "terms-of-service" || slug === "terms-and-conditions") {
      throw redirect({ to: "/terms", statusCode: 301 });
    }
    if (slug === "cookie-policy" || slug === "cookies") {
      throw redirect({ to: "/cookie-policy", statusCode: 301 });
    }
    if (slug === "disclaimer") {
      throw redirect({ to: "/disclaimer", statusCode: 301 });
    }
    if (slug === "editorial-policy") {
      throw redirect({ to: "/editorial-policy", statusCode: 301 });
    }
    if (slug === "methodology") {
      throw redirect({ to: "/methodology", statusCode: 301 });
    }
    if (slug === "about" || slug === "about-us") {
      throw redirect({ to: "/about", statusCode: 301 });
    }
    if (slug === "contact" || slug === "contact-us") {
      throw redirect({ to: "/contact", statusCode: 301 });
    }
    if (slug === "report-error") {
      throw redirect({ to: "/report-error", statusCode: 301 });
    }

    try {
      const page = await getLegalPage({ data: { slug: params.slug } });
      if (page) return { page };
    } catch {
      // fallback
    }

    throw notFound();
  },
  head: ({ loaderData, params }) => {
    const p: any = loaderData?.page ?? {};
    const title = p.meta_title || p.title || "Legal Notice";
    const desc = p.meta_description || `${p.title || "Legal document"} — EnglishTypingTest.org.`;
    const canonical = p.canonical_url?.startsWith("http")
      ? p.canonical_url
      : `https://www.englishtypingtest.org/legal/${params.slug}`;
    const meta: any[] = [
      { title },
      { name: "description", content: desc },
      { name: "robots", content: p.robots || "index,follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: canonical },
      { property: "og:type", content: "article" },
    ];
    if (p.og_image) meta.push({ property: "og:image", content: p.og_image });
    const links: any[] = [{ rel: "canonical", href: canonical }];
    const scripts: any[] = [];
    if (p.schema_jsonld)
      scripts.push({ type: "application/ld+json", children: JSON.stringify(p.schema_jsonld) });
    if (p.breadcrumbs)
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: p.breadcrumbs,
        }),
      });
    return { meta, links, scripts };
  },
  component: LegalPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Document Not Found</h1>
        <p className="mt-3 text-muted-foreground">
          The requested legal document could not be located. You can explore our official compliance policies below:
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 text-left">
          <Link
            to="/privacy"
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:bg-surface-elevated transition-colors"
          >
            <span className="font-semibold text-foreground">Privacy Policy</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
          <Link
            to="/terms"
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:bg-surface-elevated transition-colors"
          >
            <span className="font-semibold text-foreground">Terms of Service</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
          <Link
            to="/cookie-policy"
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:bg-surface-elevated transition-colors"
          >
            <span className="font-semibold text-foreground">Cookie Policy</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
          <Link
            to="/disclaimer"
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:bg-surface-elevated transition-colors"
          >
            <span className="font-semibold text-foreground">Disclaimer</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        </div>
      </main>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Legal &amp; Policy Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our official transparency, privacy, and compliance guidelines:
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/privacy"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-elevated"
          >
            Terms of Service
          </Link>
          <Link
            to="/cookie-policy"
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-elevated"
          >
            Cookie Policy
          </Link>
          <Link
            to="/disclaimer"
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-elevated"
          >
            Disclaimer
          </Link>
        </div>
      </main>
    </div>
  ),
});

function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{1,6} /.test(line)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      const level = line.match(/^#+/)![0].length;
      out.push(`<h${level}>${esc(line.replace(/^#+\s*/, ""))}</h${level}>`);
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(esc(line.replace(/^\s*[-*]\s+/, "")))}</li>`);
    } else if (!line.trim()) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push("");
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<p>${inline(esc(line))}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
  function inline(s: string) {
    return s
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline text-primary">$1</a>');
  }
}

function LegalPage() {
  const { page } = Route.useLoaderData();
  const html = page.format === "html" ? page.content : renderMarkdown(page.content);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Breadcrumbs />
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">{page.title}</h1>
        {page.updated_at && (
          <div className="mt-2 text-xs text-muted-foreground">
            Last updated: {new Date(page.updated_at).toLocaleDateString()}
          </div>
        )}
        <article
          className="prose prose-invert mt-8 max-w-none text-muted-foreground [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}
