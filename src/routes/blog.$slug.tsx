import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getPostBySlug } from "@/lib/blog.functions";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RelatedContentWidget } from "@/components/seo/RelatedContentWidget";
import { getActiveAnchorTexts, getApprovedSuggestionsForPage } from "@/lib/linking-system.functions";
import { injectInternalLinks } from "@/lib/linking.utils";

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
    const title = p?.seo_title ?? (p?.title ? `${p.title} — Blog` : `Blog — ${params.slug}`);
    const desc =
      p?.seo_description ??
      p?.excerpt ??
      "Typing tips and product updates from englishtypingtest.org.";
    const url = `https://www.englishtypingtest.org/blog/${params.slug}`;

    const scripts: Array<{ type: string; children: string }> = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.englishtypingtest.org/" },
            { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.englishtypingtest.org/blog" },
            { "@type": "ListItem", position: 3, name: p?.title ?? params.slug, item: url },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p?.title ?? title,
          description: desc,
          url,
          datePublished: p?.published_at,
          dateModified: p?.updated_at ?? p?.published_at,
          image: p?.cover_image
            ? p.cover_image.startsWith("http")
              ? p.cover_image
              : `https://www.englishtypingtest.org${p.cover_image}`
            : p?.og_image
              ? p.og_image.startsWith("http")
                ? p.og_image
                : `https://www.englishtypingtest.org${p.og_image}`
              : "https://www.englishtypingtest.org/apple-touch-icon.png",
          author: p?.author
            ? {
                "@type": "Person",
                name: p.author.name,
                url: "https://www.englishtypingtest.org/about",
              }
            : undefined,
          publisher: {
            "@type": "Organization",
            name: "English Typing Test",
            url: "https://www.englishtypingtest.org/",
            logo: {
              "@type": "ImageObject",
              url: "https://www.englishtypingtest.org/favicon.ico",
            },
          },
        }),
      },
    ];

    if (params.slug === "what-is-a-good-typing-speed") {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is considered an average typing speed worldwide?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Across the general global population of computer users, the average typing speed is approximately 38 to 42 Words Per Minute (WPM) with an accuracy rate around 92%. Experienced touch typists who use all ten fingers typically average between 50 and 65 WPM.",
              },
            },
            {
              "@type": "Question",
              name: "Is 40 WPM fast enough for an office or remote job?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. For most standard administrative, sales, customer care, and managerial positions, 40 to 45 WPM is completely sufficient. What matters most to employers is accuracy (at least 95%) and the ability to produce clean, professional documents without constant spelling corrections.",
              },
            },
            {
              "@type": "Question",
              name: "How does EnglishTypingTest.org calculate WPM and accuracy?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "EnglishTypingTest.org follows international standard metrics: one standardized word equals 5 keystrokes (including spaces and punctuation). Gross WPM is calculated as (Total Keystrokes / 5) / Time. Net WPM subtracts uncorrected errors. Accuracy is the percentage of correct keystrokes out of total attempted keystrokes.",
              },
            },
            {
              "@type": "Question",
              name: "Why does my typing speed drop sharply when numbers and symbols appear?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Most users practice alphabetical words far more often than numeric or punctuation keys. Because numbers (1–0) and special symbols are located on the top number row, your fingers have to travel farther from the home row. Practicing dedicated number row exercises will quickly close this gap.",
              },
            },
            {
              "@type": "Question",
              name: "How long does it take to increase typing speed from 30 WPM to 60 WPM?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "With consistent daily practice of 15 to 20 minutes, most learners progress from 30 WPM to 50–60 WPM within 4 to 8 weeks. The key is transitioning from 2-finger hunt-and-peck to full 10-finger touch typing, focusing on accuracy first before attempting to speed up.",
              },
            },
            {
              "@type": "Question",
              name: "Can I pass the SSC CGL typing test if I type 32 WPM?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, provided your accuracy is exceptional. The SSC CGL DEST requirement is 2,000 keystrokes in 15 minutes, which equates to roughly 26.7 WPM. However, we recommend building a comfortable cushion of 35 to 40 WPM during practice tests to account for exam hall keyboard variations and nerves.",
              },
            },
          ],
        }),
      });
    }

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: p?.title ?? title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(p?.og_image || p?.cover_image
          ? [
              {
                property: "og:image",
                content: (p.og_image ?? p.cover_image).startsWith("http")
                  ? (p.og_image ?? p.cover_image)
                  : `https://www.englishtypingtest.org${p.og_image ?? p.cover_image}`,
              } as const,
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
});

function PostPage() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getPostBySlug);
  const getAnchors = useServerFn(getActiveAnchorTexts);
  const getSuggestions = useServerFn(getApprovedSuggestionsForPage);

  const { data, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fn({ data: { slug } }),
  });

  const { data: anchors } = useQuery({
    queryKey: ["active-anchor-texts"],
    queryFn: () => getAnchors(),
  });

  const { data: suggestions } = useQuery({
    queryKey: ["approved-linking-suggestions", `/blog/${slug}`],
    queryFn: () => getSuggestions({ data: { path: `/blog/${slug}` } }),
  });

  const html = useMemo(() => {
    if (!data?.body_markdown) return "";
    const raw = marked.parse(data.body_markdown, { async: false }) as string;
    const sanitized = typeof window === "undefined" ? raw : DOMPurify.sanitize(raw);
    
    // Combine manual anchors and approved AI suggestions
    const combined = [
      ...((anchors as any) ?? []).map((a: any) => ({ keyword: a.keyword, target_url: a.target_url })),
      ...((suggestions as any) ?? []).map((s: any) => ({ keyword: s.keyword, target_url: s.target_path })),
    ];
    
    return injectInternalLinks(sanitized, combined);
  }, [data?.body_markdown, anchors, suggestions]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs />
        
        {isLoading && <div className="text-sm text-muted-foreground mt-4">Loading…</div>}
        {!isLoading && !data && (
          <div className="text-sm text-muted-foreground mt-4">Post not found.</div>
        )}
        {data && (
          <article className="mt-4">
            <header className="mb-6 border-b border-border pb-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                {data.category && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                    {data.category.name}
                  </span>
                )}
                {data.published_at && (
                  <time dateTime={data.published_at}>
                    {new Date(data.published_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                )}
              </div>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {data.title}
              </h1>
              {data.excerpt && <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{data.excerpt}</p>}
              {data.author && (
                <div className="mt-5 flex items-center gap-3">
                  {data.author.avatar_url && (
                    <img
                      src={data.author.avatar_url}
                      alt={data.author.name}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Written by <span className="font-semibold">{data.author.name}</span>
                    </div>
                    {data.author.bio && <div className="text-xs text-muted-foreground">{data.author.bio}</div>}
                  </div>
                </div>
              )}
            </header>
            {data.cover_image && (
              <img
                src={data.cover_image}
                alt={data.title}
                className="mb-8 w-full rounded-xl object-cover border border-border/50 shadow-md"
                loading="lazy"
              />
            )}
            <div
              className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {data.author && (
              <div className="mt-12 rounded-xl border border-border bg-card/60 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {data.author.avatar_url && (
                    <img
                      src={data.author.avatar_url}
                      alt={data.author.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
                    />
                  )}
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-primary">About the Author</div>
                    <div className="mt-1 font-display text-xl font-bold">{data.author.name}</div>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{data.author.bio}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                      <Link to="/about" className="hover:text-primary transition-colors underline">
                        Meet the Developer
                      </Link>
                      <span>•</span>
                      <Link to="/editorial-policy" className="hover:text-primary transition-colors underline">
                        Editorial Policy
                      </Link>
                      <span>•</span>
                      <Link to="/methodology" className="hover:text-primary transition-colors underline">
                        Testing Methodology
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

        <RelatedContentWidget />
      </main>
    </div>
  );
}
