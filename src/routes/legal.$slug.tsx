import { createFileRoute, notFound } from "@tanstack/react-router";
import { getLegalPage } from "@/lib/footer.functions";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/legal/$slug")({
  loader: async ({ params }) => {
    const page = await getLegalPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData, params }) => {
    const p: any = loaderData?.page ?? {};
    const title = p.meta_title || p.title || "Legal";
    const desc = p.meta_description || `${p.title} — official legal page.`;
    const meta: any[] = [
      { title },
      { name: "description", content: desc },
      { name: "robots", content: p.robots || "index,follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: `/legal/${params.slug}` },
      { property: "og:type", content: "article" },
    ];
    if (p.og_image) meta.push({ property: "og:image", content: p.og_image });
    const links: any[] = [{ rel: "canonical", href: p.canonical_url || `/legal/${params.slug}` }];
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
    <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
      Page not found.
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
      Failed to load: {error.message}
    </div>
  ),
});

function renderMarkdown(md: string): string {
  // Lightweight markdown: headings, bold, italics, lists, links, paragraphs.
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
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold tracking-tight">{page.title}</h1>
      <div className="mt-2 text-xs text-muted-foreground">
        Last updated: {new Date(page.updated_at).toLocaleDateString()}
      </div>
      <article
        className="prose prose-invert mt-8 max-w-none [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      </main>
    </>
  );
}
