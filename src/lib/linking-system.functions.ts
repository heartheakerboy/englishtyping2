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
