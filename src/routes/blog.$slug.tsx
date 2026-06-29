import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getPostBySlug } from "@/lib/blog.functions";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
  loader: async ({ params }) => {
    try {
      const post = await getPostBySlug({ data: { slug: params.slug } });
      return { post };
    } catch {
      return { post: null as any };
    }
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    const title = p?.title ? `${p.title} — Blog` : `Blog — ${params.slug}`;
    const desc =
      p?.seo_description ??
      p?.excerpt ??
      "Typing tips and product updates from englishtypingtest.org.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: p?.title ?? title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/blog/${params.slug}` },
        { property: "og:type", content: "article" },
        ...(p?.og_image || p?.cover_image
          ? [{ property: "og:image", content: p.og_image ?? p.cover_image } as const]
          : []),
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
    };
  },
});

function PostPage() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getPostBySlug);
  const { data, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fn({ data: { slug } }),
  });

  const html = useMemo(() => {
    if (!data?.body_markdown) return "";
    const raw = marked.parse(data.body_markdown, { async: false }) as string;
    if (typeof window === "undefined") return raw;
    return DOMPurify.sanitize(raw);
  }, [data?.body_markdown]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link to="/blog" className="hover:text-foreground">
            Blog
          </Link>{" "}
          / <span className="text-foreground">{slug}</span>
        </nav>
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && !data && (
          <div className="text-sm text-muted-foreground">Post not found.</div>
        )}
        {data && (
          <article>
            <header className="mb-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {data.published_at ? new Date(data.published_at).toLocaleDateString() : ""}
              </div>
              <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">{data.title}</h1>
              {data.excerpt && <p className="mt-3 text-lg text-muted-foreground">{data.excerpt}</p>}
              {data.author && (
                <div className="mt-4 text-sm text-muted-foreground">By {data.author.name}</div>
              )}
            </header>
            {data.cover_image && (
              <img
                src={data.cover_image}
                alt={data.title}
                className="mb-6 w-full rounded-xl object-cover"
                loading="lazy"
              />
            )}
            <div
              className="prose prose-invert max-w-none prose-headings:font-display"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {/* JSON-LD article schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Article",
                  headline: data.title,
                  description: data.seo_description ?? data.excerpt ?? "",
                  image: data.og_image ?? data.cover_image ?? undefined,
                  datePublished: data.published_at,
                  author: data.author ? { "@type": "Person", name: data.author.name } : undefined,
                }),
              }}
            />
          </article>
        )}
      </main>
    </div>
  );
}
