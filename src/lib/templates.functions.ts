// Template Marketplace server functions: public listing, CRUD, favorites,
// reviews, reports, usages, admin moderation, AI generator.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import { generateText } from "ai";
import { getAiModel } from "./ai-gateway.server";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "template";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function ensureAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) {
    const { data: ed } = await supabase.rpc("has_role", { _user_id: userId, _role: "editor" });
    if (!ed) throw new Error("Forbidden");
  }
}

// ============= PUBLIC LISTING =============
export const listPublicTemplates = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().optional().default(""),
        category: z.string().optional().nullable(),
        language: z.string().optional().nullable(),
        difficulty: z.string().optional().nullable(),
        premium: z.enum(["all", "free", "premium"]).optional().default("all"),
        duration: z.enum(["all", "short", "medium", "long"]).optional().default("all"),
        sort: z.enum(["popular", "new", "featured", "rating"]).optional().default("popular"),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).max(60).optional().default(24),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("templates")
      .select(
        "id, slug, name, description, thumbnail_url, banner_url, category_id, language, difficulty, duration_seconds, is_featured, is_pinned, is_premium, price_cents, currency, discount_percent, views_count, uses_count, favorites_count, rating_avg, rating_count, published_at",
        { count: "exact" },
      )
      .eq("status", "published")
      .eq("visibility", "public");

    if (data.search) q = q.or(`name.ilike.%${data.search}%,description.ilike.%${data.search}%`);
    if (data.category) {
      const { data: cat } = await sb
        .from("template_categories")
        .select("id")
        .eq("slug", data.category)
        .maybeSingle();
      if (cat?.id) q = q.eq("category_id", cat.id);
      else return { items: [], total: 0 };
    }
    if (data.language) q = q.eq("language", data.language);
    if (data.difficulty) q = q.eq("difficulty", data.difficulty);
    if (data.premium === "free") q = q.eq("is_premium", false);
    if (data.premium === "premium") q = q.eq("is_premium", true);
    if (data.duration === "short") q = q.lte("duration_seconds", 60);
    else if (data.duration === "medium")
      q = q.gt("duration_seconds", 60).lte("duration_seconds", 300);
    else if (data.duration === "long") q = q.gt("duration_seconds", 300);

    if (data.sort === "new") q = q.order("published_at", { ascending: false, nullsFirst: false });
    else if (data.sort === "featured")
      q = q
        .order("is_pinned", { ascending: false })
        .order("is_featured", { ascending: false })
        .order("uses_count", { ascending: false });
    else if (data.sort === "rating")
      q = q.order("rating_avg", { ascending: false }).order("rating_count", { ascending: false });
    else q = q.order("uses_count", { ascending: false }).order("views_count", { ascending: false });

    const from = (data.page - 1) * data.pageSize;
    q = q.range(from, from + data.pageSize - 1);

    const { data: items, count, error } = await q;
    if (error) throw error;
    return { items: items ?? [], total: count ?? 0 };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("template_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getPublicTemplateBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: tpl, error } = await sb
      .from("templates")
      .select(
        "id, slug, name, description, thumbnail_url, banner_url, category_id, language, difficulty, duration_seconds, content_text, content_mode, is_featured, is_premium, price_cents, currency, discount_percent, leaderboard_enabled, certificate_enabled, reward_xp, reward_coins, attempt_limit, password_hash, views_count, uses_count, favorites_count, rating_avg, rating_count, seo_title, seo_description, og_image_url, schema_jsonld, published_at, creator_id",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .eq("visibility", "public")
      .maybeSingle();
    if (error) throw error;
    if (!tpl) return null;

    // Strip content_text if password protected
    const protectedTpl = tpl.password_hash
      ? { ...tpl, content_text: "", password_required: true }
      : { ...tpl, password_required: false };
    delete (protectedTpl as any).password_hash;

    // Best-effort view increment
    await sb.rpc("tpl_increment_views", { _slug: data.slug });

    // Reviews
    const { data: reviews } = await sb
      .from("template_reviews")
      .select("id, user_id, rating, body, created_at, parent_id")
      .eq("template_id", tpl.id)
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .limit(50);

    // Tags
    const { data: tagRows } = await sb
      .from("template_tag_map")
      .select("tag_id, template_tags(name, slug)")
      .eq("template_id", tpl.id);
    const tags = (tagRows ?? []).map((r: any) => r.template_tags).filter(Boolean);

    // Category slug
    let categorySlug: string | null = null;
    if (tpl.category_id) {
      const { data: cat } = await sb
        .from("template_categories")
        .select("slug, name")
        .eq("id", tpl.category_id)
        .maybeSingle();
      categorySlug = cat?.slug ?? null;
      (protectedTpl as any).category_name = cat?.name ?? null;
      (protectedTpl as any).category_slug = categorySlug;
    }

    return { template: protectedTpl, reviews: reviews ?? [], tags };
  });

export const listPublishedSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("templates")
    .select("slug, updated_at")
    .eq("status", "published")
    .eq("visibility", "public")
    .limit(5000);
  return data ?? [];
});

// ============= AUTHENTICATED (CRUD) =============
const TemplateInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(160),
  description: z.string().max(4000).default(""),
  thumbnail_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  category_slug: z.string().nullable().optional(),
  tags: z.array(z.string().max(40)).max(15).default([]),
  language: z.string().default("en"),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  duration_seconds: z.number().int().min(10).max(7200).default(60),
  content_mode: z.enum(["time", "words", "quote", "code", "custom"]).default("time"),
  content_text: z.string().min(1).max(50000),
  content_source: z.enum(["manual", "ai", "library"]).default("manual"),
  ai_prompt: z.string().max(500).nullable().optional(),
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
  password: z.string().max(120).nullable().optional(),
  attempt_limit: z.number().int().min(0).max(99999).nullable().optional(),
  certificate_enabled: z.boolean().default(false),
  leaderboard_enabled: z.boolean().default(true),
  leaderboard_scope: z.enum(["global", "private", "off"]).default("global"),
  reward_xp: z.number().int().min(0).max(100000).default(0),
  reward_coins: z.number().int().min(0).max(100000).default(0),
  is_premium: z.boolean().default(false),
  price_cents: z.number().int().min(0).max(1000000).default(0),
  currency: z.string().length(3).default("USD"),
  discount_percent: z.number().int().min(0).max(100).default(0),
  seo_title: z.string().max(160).nullable().optional(),
  seo_description: z.string().max(320).nullable().optional(),
  og_image_url: z.string().url().nullable().optional(),
});

async function resolveCategoryId(sb: any, slug: string | null | undefined) {
  if (!slug) return null;
  const { data } = await sb.from("template_categories").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function uniqueSlug(sb: any, base: string, excludeId?: string) {
  let s = slugify(base);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? s : `${s}-${n}`;
    const { data } = await sb.from("templates").select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    n += 1;
    if (n > 50) return `${s}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

async function upsertTags(sb: any, templateId: string, tags: string[]) {
  if (!tags.length) {
    await sb.from("template_tag_map").delete().eq("template_id", templateId);
    return;
  }
  const tagIds: string[] = [];
  for (const raw of tags) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name);
    const { data: existing } = await sb
      .from("template_tags")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing?.id) tagIds.push(existing.id);
    else {
      const { data: inserted } = await sb
        .from("template_tags")
        .insert({ slug, name })
        .select("id")
        .maybeSingle();
      if (inserted?.id) tagIds.push(inserted.id);
    }
  }
  await sb.from("template_tag_map").delete().eq("template_id", templateId);
  if (tagIds.length) {
    await sb
      .from("template_tag_map")
      .insert(tagIds.map((tag_id) => ({ template_id: templateId, tag_id })));
  }
}

async function hashPassword(pw: string) {
  const buf = new TextEncoder().encode(pw);
  const out = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(out))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const saveTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TemplateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const category_id = await resolveCategoryId(supabase, data.category_slug);
    const password_hash = data.password ? await hashPassword(data.password) : null;
    const word_count = data.content_text.trim().split(/\s+/).filter(Boolean).length;

    const payload: any = {
      creator_id: userId,
      name: data.name,
      description: data.description,
      thumbnail_url: data.thumbnail_url ?? null,
      banner_url: data.banner_url ?? null,
      category_id,
      language: data.language,
      difficulty: data.difficulty,
      duration_seconds: data.duration_seconds,
      content_mode: data.content_mode,
      content_text: data.content_text,
      content_source: data.content_source,
      ai_prompt: data.ai_prompt ?? null,
      word_count,
      visibility: data.visibility,
      password_hash,
      attempt_limit: data.attempt_limit ?? null,
      certificate_enabled: data.certificate_enabled,
      leaderboard_enabled: data.leaderboard_enabled,
      leaderboard_scope: data.leaderboard_scope,
      reward_xp: data.reward_xp,
      reward_coins: data.reward_coins,
      is_premium: data.is_premium,
      price_cents: data.price_cents,
      currency: data.currency,
      discount_percent: data.discount_percent,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      og_image_url: data.og_image_url ?? null,
    };

    if (data.id) {
      const { data: existing } = await supabase
        .from("templates")
        .select("slug, creator_id")
        .eq("id", data.id)
        .maybeSingle();
      if (!existing) throw new Error("Not found");
      const { data: updated, error } = await supabase
        .from("templates")
        .update(payload)
        .eq("id", data.id)
        .select("id, slug")
        .maybeSingle();
      if (error) throw error;
      await upsertTags(supabase, data.id, data.tags);
      // Snapshot
      await supabase
        .from("template_revisions")
        .insert({ template_id: data.id, snapshot: payload, created_by: userId });
      return updated;
    }

    const slug = await uniqueSlug(supabase, data.name);
    const { data: inserted, error } = await supabase
      .from("templates")
      .insert({ ...payload, slug, status: "draft" })
      .select("id, slug")
      .maybeSingle();
    if (error) throw error;
    if (inserted?.id) {
      await upsertTags(supabase, inserted.id, data.tags);
      await supabase
        .from("template_revisions")
        .insert({ template_id: inserted.id, snapshot: payload, created_by: userId });
    }
    return inserted;
  });

export const deleteTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("templates").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const duplicateTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: src } = await supabase
      .from("templates")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!src) throw new Error("Not found");
    const slug = await uniqueSlug(supabase, `${src.name}-copy`);
    const copy: any = {
      ...src,
      slug,
      name: `${src.name} (copy)`,
      status: "draft",
      is_featured: false,
      is_pinned: false,
      views_count: 0,
      uses_count: 0,
      copies_count: 0,
      favorites_count: 0,
      rating_avg: 0,
      rating_count: 0,
      published_at: null,
      creator_id: userId,
    };
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    const { data: inserted, error } = await supabase
      .from("templates")
      .insert(copy)
      .select("id, slug")
      .maybeSingle();
    if (error) throw error;
    // Log copy on the source
    await supabase
      .from("template_usages")
      .insert({ template_id: data.id, user_id: userId, action: "copy" });
    return inserted;
  });

export const setTemplateStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["draft", "pending", "published", "rejected", "archived"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    let nextStatus = data.status;
    // Non-admins publishing → pending
    if (!isAdmin && data.status === "published") nextStatus = "pending";
    const patch: any = { status: nextStatus };
    if (nextStatus === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("templates").update(patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true, status: nextStatus };
  });

export const myTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("templates")
      .select(
        "id, slug, name, description, thumbnail_url, status, visibility, is_premium, price_cents, currency, views_count, uses_count, favorites_count, rating_avg, updated_at",
      )
      .eq("creator_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getMyTemplate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: tpl, error } = await context.supabase
      .from("templates")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!tpl) throw new Error("Not found");
    const { data: tagRows } = await context.supabase
      .from("template_tag_map")
      .select("template_tags(name, slug)")
      .eq("template_id", data.id);
    const tags = (tagRows ?? []).map((r: any) => r.template_tags?.name).filter(Boolean);
    let category_slug: string | null = null;
    if (tpl.category_id) {
      const { data: c } = await context.supabase
        .from("template_categories")
        .select("slug")
        .eq("id", tpl.category_id)
        .maybeSingle();
      category_slug = c?.slug ?? null;
    }
    return { ...tpl, tags, category_slug };
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ template_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("template_favorites")
      .select("user_id")
      .eq("user_id", userId)
      .eq("template_id", data.template_id)
      .maybeSingle();
    if (existing) {
      await supabase
        .from("template_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("template_id", data.template_id);
      return { favorited: false };
    }
    await supabase
      .from("template_favorites")
      .insert({ user_id: userId, template_id: data.template_id });
    return { favorited: true };
  });

export const myFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("template_favorites")
      .select(
        "template_id, created_at, templates!inner(id, slug, name, description, thumbnail_url, language, difficulty, duration_seconds, is_premium, rating_avg, uses_count)",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((r: any) => ({ ...r.templates, favorited_at: r.created_at }));
  });

export const myRecentlyUsed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("template_usages")
      .select(
        "template_id, created_at, action, templates!inner(id, slug, name, description, thumbnail_url, language, difficulty, duration_seconds, is_premium, rating_avg)",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    const seen = new Set<string>();
    const items: any[] = [];
    for (const r of data ?? []) {
      const id = (r as any).template_id;
      if (seen.has(id)) continue;
      seen.add(id);
      items.push({ ...(r as any).templates, used_at: (r as any).created_at });
    }
    return items;
  });

export const logTemplateUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        template_id: z.string().uuid(),
        action: z.enum(["use", "copy", "view"]).default("use"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("template_usages")
      .insert({ template_id: data.template_id, user_id: context.userId, action: data.action });
    return { ok: true };
  });

export const reviewTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        template_id: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        body: z.string().max(2000).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("template_reviews").upsert(
      {
        template_id: data.template_id,
        user_id: userId,
        rating: data.rating,
        body: data.body,
        status: "visible",
        parent_id: null,
      },
      { onConflict: "template_id,user_id,parent_id" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const reportTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        template_id: z.string().uuid(),
        reason: z.string().min(2).max(80),
        details: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("template_reports").insert({
      template_id: data.template_id,
      user_id: context.userId,
      reason: data.reason,
      details: data.details ?? null,
    });
    if (error) throw error;
    return { ok: true };
  });

export const verifyTemplatePassword = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ slug: z.string(), password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: tpl } = await sb
      .from("templates")
      .select("password_hash, content_text")
      .eq("slug", data.slug)
      .eq("status", "published")
      .eq("visibility", "public")
      .maybeSingle();
    if (!tpl?.password_hash) return { ok: false };
    const hash = await hashPassword(data.password);
    if (hash !== tpl.password_hash) return { ok: false };
    return { ok: true, content_text: tpl.content_text };
  });

export const exportTemplateJson = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: tpl } = await context.supabase
      .from("templates")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!tpl) throw new Error("Not found");
    return tpl;
  });

export const importTemplateJson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ payload: z.record(z.string(), z.any()) }).parse(d))
  .handler(async ({ data, context }) => {
    const p = data.payload as Record<string, any>;
    const name = String(p.name ?? "Imported template").slice(0, 160);
    const content_text = String(p.content_text ?? "");
    if (content_text.length < 1) throw new Error("Missing content_text");
    const payload: any = {
      creator_id: context.userId,
      name,
      description: String(p.description ?? "").slice(0, 4000),
      content_text,
      content_mode: ["time", "words", "quote", "code", "custom"].includes(p.content_mode)
        ? p.content_mode
        : "time",
      content_source: "manual",
      duration_seconds: Number(p.duration_seconds) || 60,
      difficulty: ["easy", "medium", "hard", "expert"].includes(p.difficulty)
        ? p.difficulty
        : "medium",
      language: String(p.language ?? "en").slice(0, 8),
      word_count: content_text.trim().split(/\s+/).filter(Boolean).length,
      status: "draft",
      visibility: "public",
    };
    const slug = await uniqueSlug(context.supabase, name);
    const { data: inserted, error } = await context.supabase
      .from("templates")
      .insert({ ...payload, slug })
      .select("id, slug")
      .maybeSingle();
    if (error) throw error;
    if (inserted?.id && Array.isArray(p.tags))
      await upsertTags(context.supabase, inserted.id, p.tags.map(String));
    return inserted;
  });

// ============= ADMIN =============
export const adminListTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ status: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("templates")
      .select(
        "id, slug, name, creator_id, status, visibility, is_featured, is_pinned, is_premium, uses_count, rating_avg, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const adminUpdateTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        patch: z.object({
          status: z.enum(["draft", "pending", "published", "rejected", "archived"]).optional(),
          is_featured: z.boolean().optional(),
          is_pinned: z.boolean().optional(),
          visibility: z.enum(["public", "unlisted", "private"]).optional(),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const patch: any = { ...data.patch };
    if (patch.status === "published") patch.published_at = new Date().toISOString();
    const { error } = await context.supabase.from("templates").update(patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ============= AI GENERATOR =============
export const generateTemplateFromBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        topic: z.string().min(2).max(200),
        difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
        language: z.string().default("en"),
        duration_seconds: z.number().int().min(15).max(3600).default(60),
        purpose: z.string().max(300).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const model = getAiModel();
    const targetWords = Math.max(40, Math.min(500, Math.round(data.duration_seconds * 0.8)));
    const sys = `You generate complete typing-test templates as STRICT JSON. Output ONLY a JSON object with these keys: name (string ≤120), description (string ≤300), content_text (a natural ${data.difficulty} prose passage in ${data.language} of about ${targetWords} words — no markdown, no quotes, no headings), tags (array of 3-6 short lowercase strings), seo_title (≤60 chars), seo_description (≤155 chars). No commentary.`;
    const prompt = `Topic: ${data.topic}\nDifficulty: ${data.difficulty}\nLanguage: ${data.language}\nDuration: ${data.duration_seconds}s${data.purpose ? `\nPurpose: ${data.purpose}` : ""}`;
    const { text } = await generateText({
      model,
      system: sys,
      prompt,
      maxOutputTokens: 1200,
    });
    // Best-effort JSON extraction
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI returned no JSON.");
    let parsed: any;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new Error("AI returned invalid JSON.");
    }
    return {
      name: String(parsed.name ?? data.topic).slice(0, 120),
      description: String(parsed.description ?? "").slice(0, 300),
      content_text: String(parsed.content_text ?? "").slice(0, 8000),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6).map(String) : [],
      seo_title: String(parsed.seo_title ?? "").slice(0, 60),
      seo_description: String(parsed.seo_description ?? "").slice(0, 155),
      suggested_xp: Math.round(data.duration_seconds / 6),
      suggested_coins: Math.max(5, Math.round(data.duration_seconds / 30)),
    };
  });
