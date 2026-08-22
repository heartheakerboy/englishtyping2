import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listPublishedPosts } from "@/lib/blog.functions";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const Route = createFileRoute("/blog")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Typing Tips & Speed Guides — English Typing Test Blog" },
      {
        name: "description",
        content:
          "Read actionable touch typing tips, WPM improvement guides, keyboard ergonomics, and exam preparation advice from englishtypingtest.org.",
      },
      {
        name: "keywords",
        content: "typing tips, improve typing speed, touch typing guide, wpm practice tips, how to type faster, typing test guide",
      },
      { property: "og:title", content: "Typing Tips & Speed Guides — English Typing Test Blog" },
      { property: "og:description", content: "Actionable touch typing tips, WPM improvement guides, and typing insights." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://englishtypingtest.org/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://englishtypingtest.org/blog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "English Typing Test Blog",
          description: "Typing tips, productivity insights and product updates.",
          url: "https://englishtypingtest.org/blog",
        }),
      },
    ],
  }),
});

function BlogIndex() {
  const list = useServerFn(listPublishedPosts);
  const { data, isLoading } = useQuery({ queryKey: ["blog-public"], queryFn: () => list() });
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs />
        <h1 className="font-display text-4xl font-bold tracking-tight mt-4">Blog</h1>
        <p className="mt-2 text-muted-foreground">Typing tips, product updates and deep dives.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {(data ?? []).map((p: any) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="block">
              <Card className="overflow-hidden transition-colors hover:border-primary/40">
                {p.cover_image && (
                  <img
                    src={p.cover_image}
                    alt=""
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
                  </div>
                  <h2 className="mt-1 text-lg font-semibold">{p.title}</h2>
                  {p.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
          {!isLoading && !data?.length && (
            <div className="text-sm text-muted-foreground">No posts yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}
