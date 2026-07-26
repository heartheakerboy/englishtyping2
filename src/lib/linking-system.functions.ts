import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function requireAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("is_admin", { _user_id: ctx.userId });
  if (!data) throw new Error("Forbidden");
}

// ───────────────────────── External Resources ─────────────────────────
const ExternalResourceInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  category: z.string(),
  country: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  is_dofollow: z.boolean().default(false),
  open_in_new_tab: z.boolean().default(true),
  is_sponsored: z.boolean().default(false),
  is_ugc: z.boolean().default(false),
  is_active: z.boolean().default(true),
  priority: z.number().int().default(0),
  tags: z.array(z.string()).default([]),
});

export const listExternalResources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { data, error } = await db
      .from("external_resources")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertExternalResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof ExternalResourceInput>) => ExternalResourceInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { id, ...rest } = data;
    const { error } = id
      ? await db.from("external_resources").update(rest).eq("id", id)
      : await db.from("external_resources").insert(rest);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteExternalResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { error } = await db.from("external_resources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ───────────────────────── Anchor Texts (Internal Links) ─────────────────────────
const AnchorTextInput = z.object({
  id: z.string().uuid().optional(),
  keyword: z.string().min(1),
  target_url: z.string().min(1),
  is_active: z.boolean().default(true),
});

export const listAnchorTexts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { data, error } = await db
      .from("anchor_texts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertAnchorText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof AnchorTextInput>) => AnchorTextInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { id, ...rest } = data;
    const { error } = id
      ? await db.from("anchor_texts").update(rest).eq("id", id)
      : await db.from("anchor_texts").insert(rest);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAnchorText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { error } = await db.from("anchor_texts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ───────────────────────── 404 Monitor ─────────────────────────
export const list404Logs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { data, error } = await db
      .from("error_404_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const clear404Logs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { error } = await db.from("error_404_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public endpoint to log 404 errors (called from routing error boundary or not found handler)
export const record404 = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { path: string; referrer?: string; user_agent?: string }) =>
      z.object({
        path: z.string(),
        referrer: z.string().optional(),
        user_agent: z.string().optional(),
      }).parse(d)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from("error_404_logs").insert({
      path: data.path,
      referrer: data.referrer || null,
      user_agent: data.user_agent || null,
    });
    return { ok: !error };
  });

// ───────────────────────── Link Analytics ─────────────────────────
export const listLinkAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { data, error } = await db
      .from("link_analytics")
      .select("*")
      .order("clicks_count", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Public click tracking endpoint
export const recordLinkClick = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { link_type: "internal" | "external"; source_path: string; target_url: string; anchor_text: string }) =>
      z.object({
        link_type: z.enum(["internal", "external"]),
        source_path: z.string(),
        target_url: z.string(),
        anchor_text: z.string(),
      }).parse(d)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from("link_analytics").upsert(
      {
        link_type: data.link_type,
        source_path: data.source_path,
        target_url: data.target_url,
        anchor_text: data.anchor_text,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "link_type,source_path,target_url,anchor_text" }
    );

    // Increment click counts
    if (!error) {
      await (supabaseAdmin as any).rpc("increment_link_clicks", {
        _link_type: data.link_type,
        _source_path: data.source_path,
        _target_url: data.target_url,
        _anchor_text: data.anchor_text,
      }).catch(() => {
        // Fallback or ignore if the RPC does not exist
      });
    }

    return { ok: !error };
  });

// ───────────────────────── Broken Link Checker ─────────────────────────
export const listBrokenLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { data, error } = await db
      .from("broken_links")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markBrokenLinkFixed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { error } = await db
      .from("broken_links")
      .update({ is_fixed: true, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const runBrokenLinkCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();

    // Fetch resources to check
    const [exts, anchors, posts] = await Promise.all([
      db.from("external_resources").select("id, url"),
      db.from("anchor_texts").select("id, target_url"),
      db.from("blog_posts").select("id, slug, body_markdown"),
    ]);

    const urlsToCheck: Array<{ source: string; target: string; type: "internal" | "external" }> = [];

    // 1. Check all external resources
    (exts.data ?? []).forEach((r: any) => {
      urlsToCheck.push({ source: "/admin/linking", target: r.url, type: "external" });
    });

    // 2. Check all anchor target URLs
    (anchors.data ?? []).forEach((r: any) => {
      urlsToCheck.push({ source: "/admin/linking", target: r.target_url, type: r.target_url.startsWith("http") ? "external" : "internal" });
    });

    // 3. Extract links from Blog posts body_markdown
    const linkRegex = /\[.*?\]\((https?:\/\/.*?)\)/g;
    (posts.data ?? []).forEach((p: any) => {
      let match;
      while ((match = linkRegex.exec(p.body_markdown || "")) !== null) {
        urlsToCheck.push({ source: `/blog/${p.slug}`, target: match[1], type: "external" });
      }
    });

    // Keep unique combinations
    const uniqueListMap = new Map<string, typeof urlsToCheck[0]>();
    urlsToCheck.forEach(item => {
      uniqueListMap.set(`${item.source}->${item.target}`, item);
    });
    const finalCheckList = Array.from(uniqueListMap.values());

    // Asynchronously check statuses in batches (max 10 parallel checks)
    const checkUrl = async (item: typeof urlsToCheck[0]) => {
      let status = 0;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(item.target, {
          method: "HEAD",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkChecker/1.0)" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        status = res.status;
      } catch {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(item.target, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkChecker/1.0)" },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          status = res.status;
        } catch {
          status = 0; // Network fail / DNS error
        }
      }

      // If status is not 200/301/302, log as broken
      if (status === 0 || status >= 400) {
        await db.from("broken_links").upsert(
          {
            source_url: item.source,
            target_url: item.target,
            status_code: status || null,
            link_type: item.type,
            is_fixed: false,
            checked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "source_url,target_url" }
        ).catch(() => {});
      }
    };

    // Run parallel batches
    const limit = 10;
    for (let i = 0; i < finalCheckList.length; i += limit) {
      const batch = finalCheckList.slice(i, i + limit);
      await Promise.all(batch.map(checkUrl));
    }

    return { checked: finalCheckList.length };
  });

// ───────────────────────── Dynamic Related Content & Link suggestions ─────────────────────────
export const getLinkSuggestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { textContent: string }) => z.object({ textContent: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const anchors = await db.from("anchor_texts").select("keyword, target_url").eq("is_active", true);

    const suggestions: Array<{ keyword: string; url: string }> = [];
    const textLower = data.textContent.toLowerCase();

    (anchors.data ?? []).forEach((anchor: any) => {
      const idx = textLower.indexOf(anchor.keyword.toLowerCase());
      if (idx !== -1) {
        suggestions.push({
          keyword: anchor.keyword,
          url: anchor.target_url,
        });
      }
    });

    return suggestions;
  });

// Public endpoint to retrieve active anchor texts for contextual linking
export const getActiveAnchorTexts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await (supabaseAdmin as any)
      .from("anchor_texts")
      .select("keyword, target_url")
      .eq("is_active", true);
    return data ?? [];
  });

// ───────────────────────── AI Suggestions Settings ─────────────────────────
export const getLinkingSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await (supabaseAdmin as any)
      .from("seo_linking_settings")
      .select("*");
    
    const settings: Record<string, any> = {
      auto_linking_enabled: true,
      max_links_per_page: 5,
      whitelist_paths: ["/typing-test", "/games", "/blog", "/calculators"],
      blacklist_paths: ["/auth", "/profile", "/admin", "/legal/privacy", "/legal/terms"],
    };
    (data ?? []).forEach((row: any) => {
      settings[row.key] = row.value;
    });
    return settings;
  });

export const updateLinkingSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; value: any }) =>
    z.object({ key: z.string(), value: z.any() }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { error } = await db
      .from("seo_linking_settings")
      .upsert(
        { key: data.key, value: data.value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ───────────────────────── Suggestions CRUD ─────────────────────────
export const listLinkSuggestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { data, error } = await db
      .from("internal_link_suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateSuggestionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "approved" | "rejected" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected"]) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { error } = await db
      .from("internal_link_suggestions")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const bulkUpdateSuggestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[]; status: "approved" | "rejected" }) =>
    z.object({ ids: z.array(z.string().uuid()), status: z.enum(["approved", "rejected"]) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    const { error } = await db
      .from("internal_link_suggestions")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ───────────────────────── Helper to compile all site pages ─────────────────────────
export async function getAllAvailablePages() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as any;

  const pages = [
    { label: "Home", path: "/" },
    { label: "Typing Test Hub", path: "/typing-test" },
    { label: "Games Hub", path: "/games" },
    { label: "Memory Sequence Game", path: "/games/memory" },
    { label: "Reaction Time Test", path: "/games/reaction" },
    { label: "CPS Clicks Test", path: "/games/cps" },
    { label: "Spacebar Speed Test", path: "/games/spacebar" },
    { label: "Keyboard Trainer", path: "/games/trainer" },
    { label: "Type Racer (Race Bots)", path: "/games/race-bots" },
    { label: "Leaderboards", path: "/leaderboard" },
    { label: "Blog Hub", path: "/blog" },
  ];

  // Fetch blog posts
  const { data: posts } = await db.from("blog_posts").select("slug, title").eq("status", "published");
  (posts ?? []).forEach((p: any) => {
    pages.push({ label: p.title, path: `/blog/${p.slug}` });
  });

  // Fetch test durations
  try {
    const { data: durs } = await db.from("test_durations").select("slug, name").eq("enabled", true);
    (durs ?? []).forEach((d: any) => {
      pages.push({ label: `${d.name} Typing Test`, path: `/typing-test/${d.slug}` });
    });
  } catch {}

  // Fetch legal pages
  try {
    const { data: legal } = await db.from("legal_pages").select("slug, title").eq("status", "published");
    (legal ?? []).forEach((l: any) => {
      pages.push({ label: l.title, path: `/legal/${l.slug}` });
    });
  } catch {}

  return pages;
}

// ───────────────────────── AI Linking Engine ─────────────────────────
export const generateInternalLinksForPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { path: string; content: string }) =>
    z.object({ path: z.string(), content: z.string() }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    
    // Get all candidate pages on the site
    const candidates = await getAllAvailablePages();
    
    // Filter out source page and blacklisted pages
    const settings = await getLinkingSettings();
    const blacklist = (settings.blacklist_paths as string[]) || [];
    const filteredCandidates = candidates.filter(
      (c) => c.path !== data.path && !blacklist.some((b) => c.path.startsWith(b))
    );
    
    if (filteredCandidates.length === 0) return { suggestions: [] };
    
    // Load AI model
    const { generateText } = await import("ai");
    const { getAiModel } = await import("./ai-gateway.server");
    
    let model;
    try {
      model = getAiModel();
    } catch {
      return { suggestions: [] };
    }
    
    const systemPrompt = `You are an SEO internal linking expert. Your task is to analyze the content of a page and suggest highly relevant, natural internal links.
You will be provided with:
1. The path of the source page.
2. The content of the source page.
3. A list of candidate destination pages on the website.

Output a strict JSON array of objects with the following format:
[
  {
    "keyword": "exact word or phrase in the content to link",
    "target_path": "the path of the destination page from the candidate list",
    "anchor_type": "exact" | "partial" | "branded" | "generic" | "long-tail",
    "score": 0.95
  }
]

SEO Rules:
- The keyword MUST exist in the content (case-insensitive).
- Do not suggest linking to the source page itself.
- Avoid duplicate links.
- Max 8 link recommendations.
- Anchor types classification:
  - 'exact': exact match of page name/topic (e.g. "WPM Calculator", "typing test")
  - 'partial': partial match (e.g. "speed testing tool")
  - 'branded': brand name references (e.g. "englishtypingtest.org practice")
  - 'generic': e.g. "click here", "read more" (use sparingly)
  - 'long-tail': descriptive phrases (e.g. "calculate your character count typing speed")
`;

    const userPrompt = `Source Path: ${data.path}
Content:
${data.content.slice(0, 8000)}

Candidate Destination Pages:
${JSON.stringify(filteredCandidates.slice(0, 80), null, 2)}
`;

    try {
      const { text } = await generateText({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        maxOutputTokens: 1200,
      });
      
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!match) return { suggestions: [] };
      const suggestionsList: any[] = JSON.parse(match[0]);
      
      const inserted = [];
      for (const sug of suggestionsList) {
        if (sug.keyword && sug.target_path) {
          const { error } = await db.from("internal_link_suggestions").upsert({
            source_path: data.path,
            target_path: sug.target_path,
            keyword: sug.keyword,
            anchor_type: sug.anchor_type || 'exact',
            status: 'pending',
            score: sug.score || 1.0,
            updated_at: new Date().toISOString()
          }, { onConflict: "source_path,target_path,keyword" });
          
          if (!error) {
            inserted.push(sug);
          }
        }
      }
      return { suggestions: inserted };
    } catch (e: any) {
      console.error("AI linking failed:", e);
      throw new Error(`AI linking generation failed: ${e.message}`);
    }
  });

export const rebuildAllInternalLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const db = await getAdminClient();
    
    // Clear all pending suggestions first
    await db.from("internal_link_suggestions").delete().eq("status", "pending");
    
    const pages = [];
    
    // 1. Get blog posts
    const { data: posts } = await db.from("blog_posts").select("slug, body_markdown, title").eq("status", "published");
    (posts ?? []).forEach((p: any) => {
      pages.push({ path: `/blog/${p.slug}`, content: `${p.title}\n\n${p.body_markdown}` });
    });
    
    // 2. Static pages content
    pages.push({ path: "/games/memory", content: "Memory Sequence Game. Test your visual memory by recalling color patterns." });
    pages.push({ path: "/games/reaction", content: "Reaction Time Test. Click as fast as you can when the screen turns green." });
    pages.push({ path: "/games/cps", content: "CPS Clicks per Second Test. Jitter click, butterfly click, drag click speed check." });
    pages.push({ path: "/games/spacebar", content: "Spacebar speed test. Mashing space bar key as fast as possible." });
    pages.push({ path: "/games/trainer", content: "Keyboard trainer row keys practice. Learn touch typing finger placements." });
    pages.push({ path: "/games/race-bots", content: "Type racer Bots sprint challenge. Compete against computer bots." });
    
    let processedCount = 0;
    for (const page of pages) {
      try {
        await generateInternalLinksForPage({ data: page });
        processedCount++;
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.error(`Skipping ${page.path}:`, err);
      }
    }
    
    return { processed: processedCount };
  });

// ───────────────────────── SEO Link Health Scores ─────────────────────────
export interface PageHealth {
  path: string;
  label: string;
  inboundCount: number;
  outboundCount: number;
  brokenCount: number;
  isOrphan: boolean;
  depth: number;
  score: number;
  recommendations: string[];
}

export const calculatePageHealthScores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PageHealth[]> => {
    await requireAdmin(context);
    const db = await getAdminClient();
    
    const [pages, suggestions, manualAnchors, brokenLinks] = await Promise.all([
      getAllAvailablePages(),
      db.from("internal_link_suggestions").select("source_path, target_path").eq("status", "approved"),
      db.from("anchor_texts").select("keyword, target_url").eq("is_active", true),
      db.from("broken_links").select("source_url, target_url").eq("is_fixed", false),
    ]);

    const activeSuggestions = suggestions.data || [];
    const activeAnchors = manualAnchors.data || [];
    const activeBroken = brokenLinks.data || [];

    // Calculate depth based on path segments
    const getPathDepth = (p: string) => {
      if (p === "/") return 0;
      return p.split("/").filter(Boolean).length;
    };

    return pages.map((page) => {
      // Inbound links match (AI approved target_path == page.path OR manual target_url == page.path)
      const inboundCount = 
        activeSuggestions.filter((s: any) => s.target_path === page.path).length +
        activeAnchors.filter((a: any) => a.target_url === page.path).length;

      // Outbound links match (AI approved source_path == page.path)
      const outboundCount = activeSuggestions.filter((s: any) => s.source_path === page.path).length;

      // Broken count matches (broken source_url == page.path)
      const brokenCount = activeBroken.filter((b: any) => b.source_url === page.path).length;

      const isOrphan = inboundCount === 0 && page.path !== "/";
      const depth = getPathDepth(page.path);

      // Score logic (starts at 100)
      let score = 100;
      const recs: string[] = [];

      if (isOrphan) {
        score -= 40;
        recs.push("Orphan status! Add at least 2 inbound links from relevant pages.");
      } else if (inboundCount < 2 && page.path !== "/") {
        score -= 10;
        recs.push("Low inbound links. Link to this page from more related articles.");
      }

      if (brokenCount > 0) {
        score -= Math.min(brokenCount * 15, 45);
        recs.push(`Fix ${brokenCount} broken links detected on this page.`);
      }

      if (outboundCount === 0 && page.path !== "/sitemap") {
        score -= 10;
        recs.push("Dead end page! Add outbound links to relevant tests or games.");
      } else if (outboundCount > 12) {
        score -= 5;
        recs.push("High link density. Consider reducing outbound links to avoid search penalties.");
      }

      if (recs.length === 0) {
        recs.push("Excellent SEO linking health. Keep updating content regularly.");
      }

      return {
        path: page.path,
        label: page.label,
        inboundCount,
        outboundCount,
        brokenCount,
        isOrphan,
        depth,
        score: Math.max(0, score),
        recommendations: recs,
      };
    });
  });

export const getSiteSitemap = createServerFn({ method: "GET" })
  .handler(async () => {
    return getAllAvailablePages();
  });

export const getApprovedSuggestionsForPage = createServerFn({ method: "GET" })
  .inputValidator((d: { path: string }) => z.object({ path: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await (supabaseAdmin as any)
      .from("internal_link_suggestions")
      .select("keyword, target_path")
      .eq("source_path", data.path)
      .eq("status", "approved");
    return rows ?? [];
  });
