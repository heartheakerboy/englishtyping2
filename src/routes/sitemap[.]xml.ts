import { createFileRoute } from "@tanstack/react-router";

const SUPPORTED_LANGS = [
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
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const reqUrl = new URL(request.url);
        const BASE_URL = `${reqUrl.protocol}//${reqUrl.host}`;

        const sitemaps = SUPPORTED_LANGS.map((lang) => {
          return [
            `  <sitemap>`,
            `    <loc>${BASE_URL}/sitemap/${lang}.xml</loc>`,
            `  </sitemap>`,
          ].join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...sitemaps,
          `</sitemapindex>`,
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
