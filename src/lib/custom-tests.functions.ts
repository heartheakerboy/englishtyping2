// Challenge Builder server functions: CRUD, AI gen, attempts, analytics.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "test";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

// Schema for test settings (used for create/update)
const TestInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
  cover_image_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  category: z.string().max(60).default("general"),
  tags: z.array(z.string().max(40)).max(20).default([]),
  content: z.string().min(10).max(50000),
  content_source: z.string().default("paste"),
  language: z.string().default("english"),
  duration_seconds: z.number().int().min(10).max(7200).default(60),
  difficulty: z.enum(["easy", "medium", "hard", "expert", "custom"]).default("medium"),
  allow_numbers: z.boolean().default(true),
  allow_symbols: z.boolean().default(true),
  allow_punctuation: z.boolean().default(true),
  allow_capitals: z.boolean().default(true),
  allow_quotes: z.boolean().default(true),
  allow_linebreaks: z.boolean().default(true),
  backspace_mode: z.enum(["allowed", "not_allowed", "limited"]).default("allowed"),
  backspace_limit: z.number().int().min(0).max(999).default(0),
  spell_check: z.boolean().default(false),
  access_type: z
    .enum([
      "public",
      "private",
      "password",
      "invite",
      "email_whitelist",
      "organization",
      "classroom",
    ])
    .default("public"),
  password: z.string().max(120).optional().nullable(),
  email_whitelist: z.array(z.string().email()).max(500).default([]),
  attempts_limit: z.number().int().min(1).max(9999).nullable().optional(),
  start_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  timezone: z.string().default("UTC"),
  auto_close: z.boolean().default(false),
  leaderboard_enabled: z.boolean().default(true),
  leaderboard_visibility: z.enum(["public", "private", "friends"]).default("public"),
  leaderboard_size: z.number().int().min(10).max(1000).default(100),
  certificate_enabled: z.boolean().default(false),
  cert_min_wpm: z.number().int().min(0).max(300).default(30),
  cert_min_accuracy: z.number().min(0).max(100).default(90),
  result_visible_stats: z.record(z.string(), z.boolean()).default({
    wpm: true,
    accuracy: true,
    mistakes: true,
    heatmap: true,
    graphs: true,
    consistency: true,
    ranking: true,
    certificate: true,
    pdf: true,
  }),
  anticheat_flags: z.record(z.string(), z.boolean()).default({
    tab_switch: true,
    copy_paste: true,
    auto_typer: true,
    macros: true,
    bots: true,
    multi_window: true,
    suspicious_speed: true,
  }),
  monetization_enabled: z.boolean().default(false),
  price_cents: z.number().int().min(0).max(999999).default(0),
  currency: z.string().length(3).default("usd"),
  slug: z.string().max(80).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

async function ensureUniqueSlug(
  sb: ReturnType<typeof publicClient>,
  base: string,
  excludeId?: string,
): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;
  while (true) {
    const test = suffix === 0 ? slug : `${slug}-${suffix}`;
    const q = sb.from("custom_tests").select("id").eq("slug", test).limit(1);
    const { data } = await q;
    if (!data || data.length === 0 || (excludeId && data[0].id === excludeId)) return test;
    suffix += 1;
  }
}

// Create or update
export const saveCustomTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TestInput.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const base = data.slug || data.name;
    const slug = await ensureUniqueSlug(publicClient(), base, data.id);
    const payload: any = { ...data, slug, creator_id: context.userId };
    delete payload.password;
    if (data.password) payload.password_hash = data.password; // stored as-is; treat as shared secret
    if (data.status === "published" && !data.id) payload.published_at = new Date().toISOString();

    if (data.id) {
      const { data: upd, error } = await sb
        .from("custom_tests")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return upd;
    }
    const { data: ins, error } = await sb.from("custom_tests").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return ins;
  });

export const listMyTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("custom_tests")
      .select("*")
      .eq("creator_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: t, error } = await context.supabase
      .from("custom_tests")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return t;
  });

export const deleteCustomTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("custom_tests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: src, error } = await sb
      .from("custom_tests")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const slug = await ensureUniqueSlug(publicClient(), `${src.slug}-copy`);
    const { id, created_at, updated_at, views_count, attempts_count, published_at, ...rest } =
      src as any;
    const { data: dup, error: ie } = await sb
      .from("custom_tests")
      .insert({
        ...rest,
        slug,
        name: `${src.name} (copy)`,
        status: "draft",
        creator_id: context.userId,
      })
      .select()
      .single();
    if (ie) throw new Error(ie.message);
    return dup;
  });

export const setTestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["draft", "published", "archived"]) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: any = { status: data.status };
    if (data.status === "published") patch.published_at = new Date().toISOString();
    const { error } = await context.supabase.from("custom_tests").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public: fetch by slug (no auth)
export const getPublicTestBySlug = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: t, error } = await sb
      .from("custom_tests")
      .select(
        "id, slug, name, description, cover_image_url, banner_url, category, tags, content, language, duration_seconds, difficulty, allow_numbers, allow_symbols, allow_punctuation, allow_capitals, allow_quotes, allow_linebreaks, backspace_mode, backspace_limit, spell_check, access_type, password_hash, start_at, expires_at, leaderboard_enabled, leaderboard_visibility, leaderboard_size, certificate_enabled, cert_min_wpm, cert_min_accuracy, result_visible_stats, anticheat_flags, monetization_enabled, price_cents, currency, status, views_count, attempts_count, creator_id",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!t) return null;
    // omit password_hash from response
    const { password_hash, ...rest } = t as any;
    return { ...rest, password_protected: !!password_hash };
  });

export const verifyTestPassword = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ slug: z.string(), password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: t } = await sb
      .from("custom_tests")
      .select("id, password_hash")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return { ok: !!t && t.password_hash === data.password };
  });

// Submit attempt (anon allowed)
const AttemptInput = z.object({
  test_id: z.string().uuid(),
  wpm: z.number().min(0).max(500),
  raw_wpm: z.number().min(0).max(500),
  accuracy: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  mistakes: z.number().int().min(0).max(99999),
  duration_actual: z.number().int().min(0).max(7200),
  flag_reasons: z.array(z.string()).max(20).default([]),
  device: z.string().max(60).optional(),
  browser: z.string().max(60).optional(),
  email: z.string().email().optional(),
});

export const submitAttempt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AttemptInput.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const flagged = data.flag_reasons.length > 0 || data.wpm > 250;
    const { data: ins, error } = await sb
      .from("custom_test_attempts")
      .insert({
        ...data,
        completed: true,
        flagged,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await sb.rpc("increment_custom_test_attempts", { _test_id: data.test_id });
    return { id: ins.id, flagged };
  });

export const incrementTestView = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ test_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    await sb.rpc("increment_custom_test_views", { _test_id: data.test_id });
    return { ok: true };
  });

// Leaderboard for a test
export const getTestLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ test_id: z.string().uuid(), limit: z.number().int().min(1).max(1000).default(100) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("custom_test_attempts")
      .select("id, user_id, email, wpm, accuracy, consistency, completed_at")
      .eq("test_id", data.test_id)
      .eq("completed", true)
      .eq("flagged", false)
      .order("wpm", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// Creator analytics
export const getTestAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: t } = await sb.from("custom_tests").select("*").eq("id", data.id).single();
    const { data: attempts } = await sb
      .from("custom_test_attempts")
      .select("*")
      .eq("test_id", data.id);
    const a = attempts ?? [];
    const completed = a.filter((x: any) => x.completed);
    const wpmAvg = completed.length
      ? completed.reduce((s: number, x: any) => s + Number(x.wpm), 0) / completed.length
      : 0;
    const accAvg = completed.length
      ? completed.reduce((s: number, x: any) => s + Number(x.accuracy), 0) / completed.length
      : 0;
    const pass = completed.filter(
      (x: any) =>
        Number(x.wpm) >= (t?.cert_min_wpm ?? 0) &&
        Number(x.accuracy) >= Number(t?.cert_min_accuracy ?? 0),
    ).length;
    const byDevice: Record<string, number> = {};
    const byBrowser: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    for (const x of a) {
      if (x.device) byDevice[x.device] = (byDevice[x.device] || 0) + 1;
      if (x.browser) byBrowser[x.browser] = (byBrowser[x.browser] || 0) + 1;
      if (x.country) byCountry[x.country] = (byCountry[x.country] || 0) + 1;
    }
    return {
      test: t,
      views: t?.views_count ?? 0,
      attempts: a.length,
      completed: completed.length,
      completionRate: a.length ? (completed.length / a.length) * 100 : 0,
      avgWpm: wpmAvg,
      avgAccuracy: accAvg,
      passRate: completed.length ? (pass / completed.length) * 100 : 0,
      topPerformers: [...completed]
        .sort((x: any, y: any) => Number(y.wpm) - Number(x.wpm))
        .slice(0, 10),
      byDevice,
      byBrowser,
      byCountry,
      flaggedCount: a.filter((x: any) => x.flagged).length,
    };
  });

// Admin: list all
export const adminListAllTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: isAdmin } = await sb.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin" as any,
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { data, error } = await sb
      .from("custom_tests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminBulkAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1).max(500),
        action: z.enum([
          "publish",
          "unpublish",
          "archive",
          "feature",
          "unfeature",
          "pin",
          "unpin",
          "delete",
        ]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: isAdmin } = await sb.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin" as any,
    });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.action === "delete") {
      await sb.from("custom_tests").delete().in("id", data.ids);
      return { ok: true };
    }
    const patch: any = {};
    if (data.action === "publish") patch.status = "published";
    if (data.action === "unpublish") patch.status = "draft";
    if (data.action === "archive") patch.status = "archived";
    if (data.action === "feature") patch.featured = true;
    if (data.action === "unfeature") patch.featured = false;
    if (data.action === "pin") patch.pinned = true;
    if (data.action === "unpin") patch.pinned = false;
    await sb.from("custom_tests").update(patch).in("id", data.ids);
    return { ok: true };
  });

// ---------- AI generation tailored for builder ----------
export const aiGenerateTestParagraph = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        topic: z.string().max(120).optional(),
        industry: z.string().max(60).optional(),
        style: z
          .enum(["paragraph", "story", "news", "quotes", "code", "government_exam"])
          .default("paragraph"),
        language: z.string().default("english"),
        difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
        readingLevel: z
          .enum(["elementary", "middle", "high_school", "college", "professional"])
          .default("high_school"),
        words: z.number().int().min(20).max(500).default(80),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is unavailable.");
    const gateway = createLovableAiGatewayProvider(key);
    const sys =
      "You generate typing-practice content. Output ONLY the requested text — no titles, quotes, markdown, or commentary.";
    const styleHint = {
      paragraph: "a single natural prose paragraph",
      story: "a short narrative story passage",
      news: "a neutral news-style passage (avoid politics, real names)",
      quotes: "3–5 short inspirational quotes separated by spaces",
      code: "a realistic code snippet (use one popular language)",
      government_exam: "a formal passage similar to SSC/government typing exam content",
    }[data.style];
    const prompt = `Write ${styleHint} of about ${data.words} words in ${data.language}. Difficulty: ${data.difficulty}. Reading level: ${data.readingLevel}.${data.topic ? ` Topic: "${data.topic}".` : ""}${data.industry ? ` Industry context: ${data.industry}.` : ""} Plain text only.`;
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: sys,
      prompt,
      maxOutputTokens: 900,
    });
    return { text: text.trim().replace(/^["'`]+|["'`]+$/g, "") };
  });

// ---------- Passage library ----------
export const listPassageLibrary = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("passage_library")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
});
