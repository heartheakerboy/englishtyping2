// Server functions for dynamic typing-test duration pages.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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

export type FaqItem = { q: string; a: string };
export type TestDuration = {
  id: string;
  slug: string;
  seconds: number | null;
  kind: "time" | "custom" | string;
  h1: string;
  nav_label: string;
  title: string;
  meta_description: string;
  description_md: string;
  banner_url: string | null;
  category: string;
  difficulty: string;
  faq: FaqItem[];
  featured: boolean;
  popular: boolean;
  is_new: boolean;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// ───────────────── Public reads ─────────────────

export const listEnabledDurations = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("test_durations" as any)
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TestDuration[];
});

export const getDurationBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("test_durations" as any)
      .select("*")
      .eq("slug", data.slug)
      .eq("enabled", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as unknown as TestDuration | null;
  });

export const getDurationLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((d: { seconds: number; limit?: number }) =>
    z
      .object({
        seconds: z.number().int().positive(),
        limit: z.number().int().min(1).max(50).default(20),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("typing_results")
      .select("id, user_id, wpm, accuracy, created_at")
      .eq("mode", "time")
      .eq("mode_value", data.seconds)
      .order("wpm", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id))).filter(
      Boolean,
    ) as string[];
    let profiles: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await sb
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);
      profiles = Object.fromEntries(
        (profs ?? []).map((p: any) => [
          p.id,
          { display_name: p.display_name, avatar_url: p.avatar_url },
        ]),
      );
    }
    return (rows ?? []).map((r) => ({
      id: r.id,
      wpm: r.wpm,
      accuracy: r.accuracy,
      created_at: r.created_at,
      display_name: profiles[r.user_id]?.display_name ?? "Anonymous",
      avatar_url: profiles[r.user_id]?.avatar_url ?? null,
    }));
  });

export const getMyDurationStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { seconds: number }) =>
    z.object({ seconds: z.number().int().positive() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("typing_results")
      .select("id, wpm, raw_wpm, accuracy, created_at")
      .eq("user_id", context.userId)
      .eq("mode", "time")
      .eq("mode_value", data.seconds)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    const best = (rows ?? []).reduce((m, r) => (r.wpm > m ? r.wpm : m), 0);
    return { best, recent: rows ?? [] };
  });

// ───────────────── Admin CRUD ─────────────────

const Input = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/i)
    .min(2)
    .max(60),
  seconds: z.number().int().positive().nullable().optional(),
  kind: z.enum(["time", "custom"]).default("time"),
  h1: z.string().min(1).max(120),
  nav_label: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  meta_description: z.string().min(1).max(320),
  description_md: z.string().max(8000).default(""),
  banner_url: z.string().url().nullable().optional(),
  category: z.string().max(40).default("general"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  faq: z
    .array(z.object({ q: z.string().max(200), a: z.string().max(2000) }))
    .max(20)
    .default([]),
  featured: z.boolean().default(false),
  popular: z.boolean().default(false),
  is_new: z.boolean().default(false),
  enabled: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const listDurationsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("test_durations" as any)
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as TestDuration[];
  });

export const upsertDuration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof Input>) => Input.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin
          .from("test_durations" as any)
          .update(data)
          .eq("id", data.id)
      : await supabaseAdmin.from("test_durations" as any).insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDuration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("test_durations" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderDurations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[] }) =>
    z.object({ ids: z.array(z.string().uuid()).min(1).max(200) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all(
      data.ids.map((id, i) =>
        supabaseAdmin
          .from("test_durations" as any)
          .update({ sort_order: (i + 1) * 10 })
          .eq("id", id),
      ),
    );
    return { ok: true };
  });
