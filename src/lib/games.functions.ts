// Server functions for the Typing Games Center:
// list active games (public), submit score (auth), leaderboard (public),
// admin CRUD + reorder.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function ensureAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data) return;
  const { data: ed } = await supabase.rpc("has_role", { _user_id: userId, _role: "editor" });
  if (!ed) throw new Error("Forbidden");
}

// =============== PUBLIC ===============

export const listActiveGames = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("game_configs")
    .select(
      "id, slug, title, description, difficulty, xp_reward, coin_reward, is_featured, sort_order, icon_url, banner_url, rules, scoring",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getGameLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        period: z.enum(["all", "daily", "weekly", "monthly"]).default("all"),
        limit: z.number().int().min(1).max(100).default(25),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("game_scores")
      .select(
        "id, user_id, score, wpm, accuracy, duration_seconds, level_reached, combo_max, difficulty, created_at",
      )
      .eq("game_slug", data.slug)
      .order("score", { ascending: false })
      .limit(data.limit);

    if (data.period !== "all") {
      const days = data.period === "daily" ? 1 : data.period === "weekly" ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      q = q.gte("created_at", since);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let profilesById = new Map<
      string,
      { display_name: string | null; avatar_url: string | null; country: string | null }
    >();
    if (ids.length) {
      const { data: profs } = await sb
        .from("profiles")
        .select("id, display_name, avatar_url, country")
        .in("id", ids);
      profilesById = new Map(
        (profs ?? []).map((p) => [
          p.id,
          { display_name: p.display_name, avatar_url: p.avatar_url, country: p.country },
        ]),
      );
    }

    return (rows ?? []).map((r, i) => ({
      ...r,
      rank: i + 1,
      display_name: profilesById.get(r.user_id)?.display_name ?? "Player",
      avatar_url: profilesById.get(r.user_id)?.avatar_url ?? null,
      country: profilesById.get(r.user_id)?.country ?? null,
    }));
  });

// =============== AUTH ===============

export const submitGameScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        score: z.number().int().min(0).max(10_000_000),
        wpm: z.number().min(0).max(400),
        accuracy: z.number().min(0).max(100),
        duration_seconds: z.number().int().min(0).max(7200),
        level_reached: z.number().int().min(1).max(999).default(1),
        combo_max: z.number().int().min(0).max(9999).default(0),
        words_typed: z.number().int().min(0).max(99999).default(0),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        metadata: z.record(z.string(), z.any()).optional().default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: result, error } = await supabase.rpc("submit_game_score", {
      _game_slug: data.slug,
      _score: data.score,
      _wpm: data.wpm,
      _accuracy: data.accuracy,
      _duration_seconds: data.duration_seconds,
      _level_reached: data.level_reached,
      _combo_max: data.combo_max,
      _words_typed: data.words_typed,
      _difficulty: data.difficulty,
      _metadata: data.metadata,
    });
    if (error) throw new Error(error.message);
    return result as { id: string; xp_awarded: number; coins_awarded: number; rank: number };
  });

export const getMyGameStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows } = await supabase
      .from("game_scores")
      .select("score, wpm, accuracy, duration_seconds, combo_max, level_reached, created_at")
      .eq("user_id", userId)
      .eq("game_slug", data.slug)
      .order("score", { ascending: false })
      .limit(5);
    const best = rows?.[0] ?? null;
    const { count } = await supabase
      .from("game_scores")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("game_slug", data.slug);
    return { best, plays: count ?? 0, recent: rows ?? [] };
  });

// Admin CRUD lives in src/lib/admin-enterprise.functions.ts
