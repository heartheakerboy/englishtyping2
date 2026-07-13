// Enterprise Admin server functions — dashboard analytics, CMS-wide CRUD,
// moderation, audit, media, ads, redirects, announcements, SEO overrides,
// games, badges, certificate templates, API keys.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function requireAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("is_admin", { _user_id: ctx.userId });
  if (!data) throw new Error("Forbidden");
}

async function audit(
  userId: string,
  action: string,
  entity_type: string,
  entity_id: string | null,
  before: any,
  after: any,
) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("admin_audit_logs")
      .insert({ user_id: userId, action, entity_type, entity_id, before, after });
  } catch {
    /* never break the action */
  }
}

// ───────────────────────── Dashboard ─────────────────────────
export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = Date.now();
    const since = (d: number) => new Date(now - d * 86_400_000).toISOString();

    const [pv1, pv7, pv30, u1, u7, u30, t1, t7, t30, rev30, sub, pvAll, devBreak] =
      await Promise.all([
        supabaseAdmin.rpc("get_unique_visitors_count", { _since: since(1) }),
        supabaseAdmin.rpc("get_unique_visitors_count", { _since: since(7) }),
        supabaseAdmin.rpc("get_unique_visitors_count", { _since: since(30) }),
        supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since(1)),
        supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since(7)),
        supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since(30)),
        supabaseAdmin
          .from("typing_results")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since(1)),
        supabaseAdmin
          .from("typing_results")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since(7)),
        supabaseAdmin
          .from("typing_results")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since(30)),
        supabaseAdmin
          .from("payments")
          .select("amount_cents, currency, created_at")
          .gte("created_at", since(30)),
        supabaseAdmin.from("subscriptions").select("plan, status"),
        supabaseAdmin
          .from("page_views")
          .select("created_at, device, browser, country, session_id, id")
          .gte("created_at", since(30))
          .limit(20000),
        supabaseAdmin.from("page_views").select("device").gte("created_at", since(7)).limit(20000),
      ]);

    // daily series: unique visitors & signups (last 30 days)
    const dayKey = (iso: string) => iso.slice(0, 10);
    const dailyPV: Record<string, number> = {};
    const dailySessions: Record<string, Set<string>> = {};
    (pvAll.data ?? []).forEach((r: any) => {
      const day = dayKey(r.created_at);
      const sid = r.session_id || r.id;
      if (!dailySessions[day]) {
        dailySessions[day] = new Set();
      }
      if (!dailySessions[day].has(sid)) {
        dailySessions[day].add(sid);
        dailyPV[day] = (dailyPV[day] ?? 0) + 1;
      }
    });
    const signups = await supabaseAdmin
      .from("profiles")
      .select("created_at")
      .gte("created_at", since(30))
      .limit(20000);
    const dailySU: Record<string, number> = {};
    (signups.data ?? []).forEach((r: any) => {
      dailySU[dayKey(r.created_at)] = (dailySU[dayKey(r.created_at)] ?? 0) + 1;
    });
    const tests = await supabaseAdmin
      .from("typing_results")
      .select("created_at, wpm")
      .gte("created_at", since(30))
      .limit(40000);
    const dailyTests: Record<string, number> = {};
    (tests.data ?? []).forEach((r: any) => {
      dailyTests[dayKey(r.created_at)] = (dailyTests[dayKey(r.created_at)] ?? 0) + 1;
    });

    const series: Array<{ date: string; pv: number; signups: number; tests: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const key = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
      series.push({
        date: key,
        pv: dailyPV[key] ?? 0,
        signups: dailySU[key] ?? 0,
        tests: dailyTests[key] ?? 0,
      });
    }

    const deviceCount: Record<string, number> = {};
    const browserCount: Record<string, number> = {};
    const countryCount: Record<string, number> = {};
    (devBreak.data ?? []).forEach((r: any) => {
      deviceCount[r.device || "unknown"] = (deviceCount[r.device || "unknown"] ?? 0) + 1;
    });
    (pvAll.data ?? []).forEach((r: any) => {
      browserCount[r.browser || "unknown"] = (browserCount[r.browser || "unknown"] ?? 0) + 1;
      countryCount[r.country || "unknown"] = (countryCount[r.country || "unknown"] ?? 0) + 1;
    });

    const revenueCents = (rev30.data ?? []).reduce(
      (s: number, p: any) => s + (p.amount_cents ?? 0),
      0,
    );
    const premium = (sub.data ?? []).filter(
      (s: any) => s.status === "active" && s.plan !== "free",
    ).length;

    return {
      pageViews: {
        d1: Number(pv1.data ?? 0),
        d7: Number(pv7.data ?? 0),
        d30: Number(pv30.data ?? 0),
      },
      signups: { d1: u1.count ?? 0, d7: u7.count ?? 0, d30: u30.count ?? 0 },
      tests: { d1: t1.count ?? 0, d7: t7.count ?? 0, d30: t30.count ?? 0 },
      revenueCents,
      premium,
      series,
      devices: Object.entries(deviceCount).map(([name, value]) => ({ name, value })),
      browsers: Object.entries(browserCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      countries: Object.entries(countryCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
    };
  });

// Public page-view ingestion
export const recordPageView = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { path: string; referrer?: string; session_id?: string; user_agent?: string }) =>
      z
        .object({
          path: z.string().min(1).max(300),
          referrer: z.string().max(500).optional(),
          session_id: z.string().max(120).optional(),
          user_agent: z.string().max(500).optional(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let device: string | null = null,
      browser: string | null = null,
      os: string | null = null;
    if (data.user_agent) {
      try {
        const { UAParser } = await import("ua-parser-js");
        const ua = new UAParser(data.user_agent).getResult();
        device = ua.device.type || "desktop";
        browser = ua.browser.name || null;
        os = ua.os.name || null;
      } catch {}
    }
    await sb.from("page_views").insert({
      path: data.path,
      referrer: data.referrer ?? null,
      session_id: data.session_id ?? null,
      device,
      browser,
      os,
    });
    return { ok: true };
  });

// ───────────────────── Audit / Activity / Login history ─────────────────────
export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? []).map((r: any) => ({ ...r, ip: r.ip ? String(r.ip) : null }));
  });
export const listActivityLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });
export const listLoginHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("admin_login_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? []).map((r: any) => ({ ...r, ip: r.ip ? String(r.ip) : null }));
  });

// ───────────────────── Texts — duplicate / schedule / versions / bulk ─────────────────────
export const duplicateText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("typing_texts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("Not found");
    const { id, created_at, updated_at, ...rest } = row as any;
    const { error } = await supabaseAdmin
      .from("typing_texts")
      .insert({ ...rest, title: `${rest.title} (copy)`, status: "draft", is_active: false });
    if (error) throw new Error(error.message);
    await audit(context.userId, "duplicate", "typing_texts", data.id, null, null);
    return { ok: true };
  });
export const scheduleText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; publish_at: string | null }) =>
    z.object({ id: z.string().uuid(), publish_at: z.string().nullable() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("typing_texts")
      .update({
        publish_at: data.publish_at,
        status: data.publish_at ? "scheduled" : "draft",
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, "schedule", "typing_texts", data.id, null, {
      publish_at: data.publish_at,
    });
    return { ok: true };
  });
export const listTextVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("typing_text_versions")
      .select("*")
      .eq("text_id", data.id)
      .order("created_at", { ascending: false })
      .limit(50);
    return rows ?? [];
  });
export const bulkImportTexts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { rows: Array<Record<string, any>> }) =>
    z.object({ rows: z.array(z.record(z.string(), z.any())).min(1).max(500) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cleaned = data.rows
      .map((r) => ({
        title: String(r.title ?? "").slice(0, 120),
        language: String(r.language ?? "english").slice(0, 20),
        category: String(r.category ?? "articles").slice(0, 40),
        difficulty: ["easy", "medium", "hard"].includes(r.difficulty) ? r.difficulty : "medium",
        content: String(r.content ?? "").slice(0, 8000),
        is_active: r.is_active === false ? false : true,
        status: r.status === "published" ? "published" : "draft",
        tags: Array.isArray(r.tags)
          ? r.tags
          : typeof r.tags === "string"
            ? r.tags
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        collection: r.collection ?? null,
        featured: !!r.featured,
      }))
      .filter((r) => r.title && r.content.length >= 20);
    if (!cleaned.length) throw new Error("No valid rows");
    const { error, data: ins } = await supabaseAdmin
      .from("typing_texts")
      .insert(cleaned)
      .select("id");
    if (error) throw new Error(error.message);
    await audit(context.userId, "bulk_import", "typing_texts", null, null, {
      count: ins?.length ?? 0,
    });
    return { inserted: ins?.length ?? 0 };
  });

// ───────────────────── Games ─────────────────────
export const listGamesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("game_configs")
      .select("*")
      .order("sort_order")
      .order("created_at");
    return data ?? [];
  });
const GameInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(2)
    .max(40),
  title: z.string().min(1).max(80),
  description: z.string().max(400).nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  timer_seconds: z.number().int().min(0).max(3600).nullable().optional(),
  xp_reward: z.number().int().min(0).max(10000).default(0),
  coin_reward: z.number().int().min(0).max(10000).default(0),
  icon_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  audio_url: z.string().url().nullable().optional(),
  levels: z.any().default({}),
  rules: z.any().default({}),
  scoring: z.any().default({}),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});
export const upsertGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof GameInput>) => GameInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("game_configs").update(data).eq("id", data.id)
      : await supabaseAdmin.from("game_configs").insert(data);
    if (error) throw new Error(error.message);
    await audit(
      context.userId,
      data.id ? "update" : "create",
      "game_configs",
      data.id ?? null,
      null,
      data,
    );
    return { ok: true };
  });
export const deleteGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("game_configs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, "delete", "game_configs", data.id, null, null);
    return { ok: true };
  });
export const reorderGames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[] }) =>
    z.object({ ids: z.array(z.string().uuid()).min(1).max(200) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all(
      data.ids.map((id, i) =>
        supabaseAdmin.from("game_configs").update({ sort_order: i }).eq("id", id),
      ),
    );
    return { ok: true };
  });

// ───────────────────── Badges ─────────────────────
export const listBadges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("badges")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });
const BadgeInput = z.object({
  id: z.string().uuid().optional(),
  code: z
    .string()
    .regex(/^[a-z0-9_-]+$/)
    .min(2)
    .max(40),
  name: z.string().min(1).max(80),
  description: z.string().max(400).nullable().optional(),
  rarity: z.enum(["common", "rare", "epic", "legendary"]).default("common"),
  color: z.string().max(20).nullable().optional(),
  icon_url: z.string().url().nullable().optional(),
  xp_reward: z.number().int().min(0).max(100000).default(0),
  coin_reward: z.number().int().min(0).max(100000).default(0),
  is_active: z.boolean().default(true),
});
export const upsertBadge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof BadgeInput>) => BadgeInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("badges").update(data).eq("id", data.id)
      : await supabaseAdmin.from("badges").insert(data);
    if (error) throw new Error(error.message);
    await audit(
      context.userId,
      data.id ? "update" : "create",
      "badges",
      data.id ?? null,
      null,
      data,
    );
    return { ok: true };
  });
export const deleteBadge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("badges").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, "delete", "badges", data.id, null, null);
    return { ok: true };
  });

// ───────────────────── Certificate templates ─────────────────────
const CertTplInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  description: z.string().max(400).nullable().optional(),
  template: z.any().default({}),
  preview_url: z.string().url().nullable().optional(),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
});
export const listCertTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("certificate_templates")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });
export const upsertCertTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof CertTplInput>) => CertTplInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.is_default)
      await supabaseAdmin
        .from("certificate_templates")
        .update({ is_default: false })
        .neq("id", data.id ?? "00000000-0000-0000-0000-000000000000");
    const { error } = data.id
      ? await supabaseAdmin.from("certificate_templates").update(data).eq("id", data.id)
      : await supabaseAdmin.from("certificate_templates").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteCertTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("certificate_templates").delete().eq("id", data.id);
    return { ok: true };
  });

// ───────────────────── Media library ─────────────────────
export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    return data ?? [];
  });
export const uploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      filename: string;
      mime_type: string;
      data_base64: string;
      folder?: string;
      alt?: string;
      tags?: string[];
    }) =>
      z
        .object({
          filename: z.string().min(1).max(200),
          mime_type: z.string().min(1).max(120),
          data_base64: z.string().min(1).max(10_500_000),
          folder: z.string().max(120).optional(),
          alt: z.string().max(300).optional(),
          tags: z.array(z.string().max(40)).max(20).optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const buf = Buffer.from(data.data_base64.split(",").pop() ?? data.data_base64, "base64");
    if (buf.byteLength > 8 * 1024 * 1024) throw new Error("Max file size is 8 MB");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${data.folder ?? "uploads"}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("media")
      .upload(path, buf, { contentType: data.mime_type, upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { data: signed } = await supabaseAdmin.storage
      .from("media")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    const url = signed?.signedUrl ?? "";
    const { error, data: row } = await supabaseAdmin
      .from("media_assets")
      .insert({
        bucket: "media",
        path,
        filename: safe,
        mime_type: data.mime_type,
        size_bytes: buf.byteLength,
        folder: data.folder ?? null,
        alt: data.alt ?? null,
        tags: data.tags ?? [],
        url,
        uploader_id: context.userId,
      })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("media_assets")
      .select("bucket, path")
      .eq("id", data.id)
      .maybeSingle();
    if (row) await supabaseAdmin.storage.from(row.bucket).remove([row.path]);
    await supabaseAdmin.from("media_assets").delete().eq("id", data.id);
    return { ok: true };
  });

// ───────────────────── Ads ─────────────────────
const AdInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  slot_key: z
    .string()
    .regex(/^[a-z0-9_-]+$/)
    .min(2)
    .max(40),
  kind: z.enum(["adsense", "custom"]).default("adsense"),
  adsense_client: z.string().max(80).nullable().optional(),
  adsense_slot: z.string().max(80).nullable().optional(),
  custom_html: z.string().max(4000).nullable().optional(),
  page_match: z.string().max(200).nullable().optional(),
  is_active: z.boolean().default(true),
});
export const listAds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("ad_placements")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });
export const upsertAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof AdInput>) => AdInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("ad_placements").update(data).eq("id", data.id)
      : await supabaseAdmin.from("ad_placements").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ad_placements").delete().eq("id", data.id);
    return { ok: true };
  });

// ───────────────────── Redirects ─────────────────────
const RedirectInput = z.object({
  id: z.string().uuid().optional(),
  source: z.string().min(1).max(300).regex(/^\//, "must start with /"),
  destination: z.string().min(1).max(500),
  status_code: z.number().int().min(300).max(399).default(301),
  is_active: z.boolean().default(true),
});
export const listRedirects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("redirects")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });
export const upsertRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof RedirectInput>) => RedirectInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("redirects").update(data).eq("id", data.id)
      : await supabaseAdmin.from("redirects").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("redirects").delete().eq("id", data.id);
    return { ok: true };
  });

// ───────────────────── Announcements ─────────────────────
const AnnInput = z.object({
  id: z.string().uuid().optional(),
  message: z.string().min(1).max(300),
  href: z.string().max(500).nullable().optional(),
  variant: z.enum(["info", "success", "warning", "promo"]).default("info"),
  dismissible: z.boolean().default(true),
  is_active: z.boolean().default(true),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});
export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });
export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof AnnInput>) => AnnInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("announcements").update(data).eq("id", data.id)
      : await supabaseAdmin.from("announcements").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("announcements").delete().eq("id", data.id);
    return { ok: true };
  });
export const getActiveAnnouncement = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  const row = (data ?? []).find(
    (a: any) => (!a.starts_at || a.starts_at <= now) && (!a.ends_at || a.ends_at >= now),
  );
  return row ?? null;
});

// ───────────────────── SEO overrides ─────────────────────
const SeoInput = z.object({
  id: z.string().uuid().optional(),
  path: z.string().min(1).max(300).regex(/^\//),
  title: z.string().max(120).nullable().optional(),
  description: z.string().max(400).nullable().optional(),
  og_title: z.string().max(120).nullable().optional(),
  og_description: z.string().max(400).nullable().optional(),
  og_image: z.string().url().max(500).nullable().optional(),
  twitter_card: z.enum(["summary", "summary_large_image"]).nullable().optional(),
  schema_json: z.any().nullable().optional(),
  noindex: z.boolean().default(false),
  is_active: z.boolean().default(true),
});
export const listSeoOverrides = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("seo_overrides").select("*").order("path");
    return data ?? [];
  });
export const upsertSeoOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof SeoInput>) => SeoInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("seo_overrides").update(data).eq("id", data.id)
      : await supabaseAdmin.from("seo_overrides").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteSeoOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("seo_overrides").delete().eq("id", data.id);
    return { ok: true };
  });

// ───────────────────── API keys ─────────────────────
export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("admin_api_keys")
      .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at, user_id")
      .order("created_at", { ascending: false });
    return data ?? [];
  });
export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; scopes?: string[] }) =>
    z
      .object({
        name: z.string().min(1).max(60),
        scopes: z.array(z.string().max(60)).max(20).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const raw = "tk_" + randomBytes(24).toString("base64url");
    const key_hash = createHash("sha256").update(raw).digest("hex");
    const key_prefix = raw.slice(0, 10);
    const { error } = await supabaseAdmin.from("admin_api_keys").insert({
      user_id: context.userId,
      name: data.name,
      key_hash,
      key_prefix,
      scopes: data.scopes,
    });
    if (error) throw new Error(error.message);
    await audit(context.userId, "create", "admin_api_keys", null, null, {
      name: data.name,
      prefix: key_prefix,
    });
    return { token: raw, prefix: key_prefix };
  });
export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("admin_api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id);
    await audit(context.userId, "revoke", "admin_api_keys", data.id, null, null);
    return { ok: true };
  });

// ───────────────────── User moderation ─────────────────────
export const banUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; reason: string }) =>
    z.object({ userId: z.string().uuid(), reason: z.string().max(400) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        banned_at: new Date().toISOString(),
        ban_reason: data.reason,
      })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    await audit(context.userId, "ban", "profiles", data.userId, null, { reason: data.reason });
    return { ok: true };
  });
export const unbanUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("profiles")
      .update({ banned_at: null, ban_reason: null })
      .eq("id", data.userId);
    await audit(context.userId, "unban", "profiles", data.userId, null, null);
    return { ok: true };
  });
export const suspendUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; until: string }) =>
    z.object({ userId: z.string().uuid(), until: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("profiles")
      .update({ suspended_until: data.until })
      .eq("id", data.userId);
    await audit(context.userId, "suspend", "profiles", data.userId, null, { until: data.until });
    return { ok: true };
  });
export const resetUserProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("typing_results").delete().eq("user_id", data.userId);
    await supabaseAdmin
      .from("profiles")
      .update({ xp: 0, level: 1, tests_completed: 0, best_wpm: 0 })
      .eq("id", data.userId);
    await audit(context.userId, "reset_progress", "profiles", data.userId, null, null);
    return { ok: true };
  });
export const addAdminNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; note: string }) =>
    z.object({ userId: z.string().uuid(), note: z.string().max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ admin_notes: data.note }).eq("id", data.userId);
    return { ok: true };
  });

// ───────────────────── Leaderboard moderation ─────────────────────
export const deleteTypingResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("typing_results").delete().eq("id", data.id);
    await audit(context.userId, "delete", "typing_results", data.id, null, null);
    return { ok: true };
  });
export const listTopResults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("typing_results")
      .select("id, user_id, wpm, accuracy, mode, language, created_at")
      .order("wpm", { ascending: false })
      .limit(100);
    return data ?? [];
  });

// ───────────────────── Payments — mark refunded ─────────────────────
export const markPaymentRefunded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("payments").update({ status: "refunded" }).eq("id", data.id);
    await audit(context.userId, "refund", "payments", data.id, null, null);
    return { ok: true };
  });

// ───────────────────── Visitor Banners ─────────────────────
const VisitorBannerInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  primary_btn_text: z.string().min(1).max(80).default("🚀 Create Free Account"),
  primary_btn_action: z.string().min(1).max(200).default("signup"),
  secondary_btn_text: z.string().min(1).max(80).default("Learn More"),
  secondary_btn_href: z.string().max(500).nullable().optional(),
  colors: z.any().optional(),
  image_url: z.string().max(500).nullable().optional(),
  icon_url: z.string().max(500).nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  target_audience: z.string().max(20).default("guests"),
  display_pages: z.string().max(200).default("all"),
});

export const listVisitorBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await (supabaseAdmin as any)
      .from("visitor_announcements")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []) as any[];
  });

export const upsertVisitorBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof VisitorBannerInput>) => VisitorBannerInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error, data: row } = data.id
      ? await (supabaseAdmin as any).from("visitor_announcements").update(data).eq("id", data.id).select().single()
      : await (supabaseAdmin as any).from("visitor_announcements").insert(data).select().single();
    if (error) throw new Error(error.message);
    await audit(context.userId, data.id ? "update" : "create", "visitor_announcements", row.id, null, null);
    return { ok: true, id: row.id };
  });

export const deleteVisitorBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin as any).from("visitor_announcements").delete().eq("id", data.id);
    await audit(context.userId, "delete", "visitor_announcements", data.id, null, null);
    return { ok: true };
  });

export const getActiveVisitorBanner = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const now = new Date().toISOString();
  const { data } = await (sb as any)
    .from("visitor_announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  const row = (data ?? []).find(
    (a: any) => (!a.starts_at || a.starts_at <= now) && (!a.ends_at || a.ends_at >= now),
  );
  return row ?? null;
});

