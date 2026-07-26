import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPPORTED_LANGS = new Set([
  "en",
  "hi",
  "mr",
  "gu",
  "ta",
  "te",
  "kn",
  "ml",
  "pa",
  "bn",
  "ur",
  "ar",
  "es",
  "fr",
  "de",
  "pt",
  "ru",
  "ja",
  "ko",
  "zh",
]);

interface SitemapEntry {
  path: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap/$lang")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // Strip .xml suffix if present to handle both /sitemap/en and /sitemap/en.xml
        const lang = params.lang.replace(".xml", "");

        if (!SUPPORTED_LANGS.has(lang)) {
          return new Response("Language not supported", { status: 404 });
        }

        const reqUrl = new URL(request.url);
        const BASE_URL = `${reqUrl.protocol}//${reqUrl.host}`;

        // Base route entries matching the actual routes
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/typing-test", changefreq: "weekly", priority: "0.9" },
          { path: "/lessons", changefreq: "monthly", priority: "0.8" },
          { path: "/leaderboard", changefreq: "daily", priority: "0.8" },
          { path: "/race", changefreq: "daily", priority: "0.7" },
          { path: "/games", changefreq: "weekly", priority: "0.6" },
          { path: "/games/race-bots", changefreq: "monthly", priority: "0.5" },
          { path: "/games/reaction", changefreq: "monthly", priority: "0.5" },
          { path: "/games/cps", changefreq: "monthly", priority: "0.5" },
          { path: "/games/spacebar", changefreq: "monthly", priority: "0.5" },
          { path: "/games/memory", changefreq: "monthly", priority: "0.5" },
          { path: "/games/trainer", changefreq: "monthly", priority: "0.5" },
          { path: "/games/falling-words", changefreq: "monthly", priority: "0.5" },
          { path: "/games/zombie-typing", changefreq: "monthly", priority: "0.5" },
          { path: "/games/balloon-burst", changefreq: "monthly", priority: "0.5" },
          { path: "/tournaments", changefreq: "weekly", priority: "0.6" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          { path: "/templates", changefreq: "daily", priority: "0.8" },
          { path: "/auth", changefreq: "monthly", priority: "0.4" },
        ];

        try {
          if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
            const sb = createClient<Database>(
              process.env.SUPABASE_URL,
              process.env.SUPABASE_PUBLISHABLE_KEY,
              {
                auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
              },
            );

            // 1. Published Blog posts
            const { data: blogData } = await sb
              .from("blog_posts")
              .select("slug, updated_at")
              .eq("status", "published")
              .order("published_at", { ascending: false })
              .limit(500);
            for (const p of blogData ?? []) {
              entries.push({
                path: `/blog/${p.slug}`,
                changefreq: "monthly",
                priority: "0.6",
                lastmod: p.updated_at ?? undefined,
              });
            }

            // 2. Enabled Test durations
            const { data: durs } = await sb
              .from("test_durations" as any)
              .select("slug, updated_at")
              .eq("enabled", true)
              .order("sort_order");
            for (const d of (durs ?? []) as unknown as Array<{
              slug: string;
              updated_at: string;
            }>) {
              entries.push({
                path: `/typing-test/${d.slug}`,
                changefreq: "weekly",
                priority: "0.8",
                lastmod: d.updated_at ?? undefined,
              });
            }

            // 3. Published Legal pages
            const { data: legal } = await sb
              .from("legal_pages" as any)
              .select("slug, updated_at")
              .eq("status", "published");
            for (const p of (legal ?? []) as unknown as Array<{
              slug: string;
              updated_at: string;
            }>) {
              entries.push({
                path: `/legal/${p.slug}`,
                changefreq: "monthly",
                priority: "0.5",
                lastmod: p.updated_at ?? undefined,
              });
            }

            // 4. Public templates
            const { data: tpls } = await sb
              .from("templates" as any)
              .select("slug, updated_at")
              .eq("status", "published")
              .eq("visibility", "public")
              .order("updated_at", { ascending: false })
              .limit(1000);
            for (const t of (tpls ?? []) as unknown as Array<{
              slug: string;
              updated_at: string;
            }>) {
              entries.push({
                path: `/templates/${t.slug}`,
                changefreq: "weekly",
                priority: "0.6",
                lastmod: t.updated_at ?? undefined,
              });
            }
          }
        } catch {
          // Keep static entries on DB query failure
        }

        const urls = entries.map((e) => {
          const connector = e.path.includes("?") ? "&" : "?";
          const absoluteLoc =
            lang === "en"
              ? `${BASE_URL}${e.path}`
              : `${BASE_URL}${e.path}${connector}lang=${lang}`;

          return [
            `  <url>`,
            `    <loc>${absoluteLoc}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
