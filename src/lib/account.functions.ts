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

// ============ Profile ============

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    // If welcome email has not been sent yet, send it and update flag
    if (data && !(data as any).welcome_email_sent) {
      try {
        const { data: authData } = await context.supabase.auth.getUser();
        if (authData?.user?.email) {
          const { sendWelcomeEmail } = await import("./resend.server");
          const sent = await sendWelcomeEmail(authData.user.email, data.display_name || "");
          if (sent) {
            await context.supabase
              .from("profiles")
              .update({ welcome_email_sent: true } as any)
              .eq("id", context.userId);
            (data as any).welcome_email_sent = true;
          }
        }
      } catch (err) {
        console.error("[WelcomeEmail] Failed to process welcome email:", err);
      }
    }

    return data;
  });

const ProfileUpdateInput = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "letters, numbers, underscore")
    .nullable()
    .optional(),
  display_name: z.string().trim().max(48).nullable().optional(),
  bio: z.string().trim().max(280).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  country: z.string().trim().max(56).nullable().optional(),
  state: z.string().trim().max(56).nullable().optional(),
  city: z.string().trim().max(56).nullable().optional(),
  is_public: z.boolean().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProfileUpdateInput.parse(d))
  .handler(async ({ data, context }) => {
    const payload = { ...data } as z.infer<typeof ProfileUpdateInput>;
    if (typeof payload.username === "string") payload.username = payload.username.toLowerCase();
    const { data: row, error } = await context.supabase
      .from("profiles")
      .update(payload)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) {
      if (error.message.includes("profiles_username_key"))
        throw new Error("That username is already taken.");
      throw new Error(error.message);
    }
    return row;
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ username: z.string().trim().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const username = data.username.toLowerCase();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, bio, country, state, city, xp, level, coins, current_streak, longest_streak, best_wpm, tests_completed, is_public, created_at",
      )
      .eq("username", username)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!profile) return null;

    const [recent, achievements, followers, following] = await Promise.all([
      supabase
        .from("typing_results")
        .select("id, mode, mode_value, wpm, raw_wpm, accuracy, language, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("user_achievements")
        .select("code, unlocked_at, achievements(name, description, icon, category)")
        .eq("user_id", profile.id),
      supabase
        .from("follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("following_id", profile.id),
      supabase
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", profile.id),
    ]);

    return {
      profile,
      recent: recent.data ?? [],
      achievements: achievements.data ?? [],
      followerCount: followers.count ?? 0,
      followingCount: following.count ?? 0,
    };
  });

// ============ Follows ============

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ targetUserId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.targetUserId === context.userId) throw new Error("You can't follow yourself.");
    const { data: existing } = await context.supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", context.userId)
      .eq("following_id", data.targetUserId)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase
        .from("follows")
        .delete()
        .eq("follower_id", context.userId)
        .eq("following_id", data.targetUserId);
      if (error) throw new Error(error.message);
      return { following: false };
    }
    const { error } = await context.supabase
      .from("follows")
      .insert({ follower_id: context.userId, following_id: data.targetUserId });
    if (error) throw new Error(error.message);
    return { following: true };
  });

export const isFollowing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ targetUserId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", context.userId)
      .eq("following_id", data.targetUserId)
      .maybeSingle();
    return { following: !!row };
  });

export const listFriends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [followingRes, followerRes] = await Promise.all([
      context.supabase
        .from("follows")
        .select("following_id, created_at")
        .eq("follower_id", context.userId)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("follows")
        .select("follower_id, created_at")
        .eq("following_id", context.userId)
        .order("created_at", { ascending: false }),
    ]);
    const followingIds = (followingRes.data ?? []).map((r) => r.following_id);
    const followerIds = (followerRes.data ?? []).map((r) => r.follower_id);
    const ids = Array.from(new Set([...followingIds, ...followerIds]));
    if (ids.length === 0) return { following: [], followers: [] };
    const { data: profiles } = await context.supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, best_wpm, level, current_streak")
      .in("id", ids);
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
    return {
      following: followingIds.map((id) => byId.get(id)).filter(Boolean),
      followers: followerIds.map((id) => byId.get(id)).filter(Boolean),
    };
  });

export const activityFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: follows } = await context.supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", context.userId);
    const ids = (follows ?? []).map((f) => f.following_id);
    if (ids.length === 0) return [];
    const [resultsRes, profilesRes] = await Promise.all([
      context.supabase
        .from("typing_results")
        .select("id, user_id, mode, mode_value, wpm, accuracy, language, created_at")
        .in("user_id", ids)
        .order("created_at", { ascending: false })
        .limit(30),
      context.supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", ids),
    ]);
    const byId = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    return (resultsRes.data ?? []).map((r) => ({ ...r, profile: byId.get(r.user_id) ?? null }));
  });

// ============ Achievements ============

export const listAchievements = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
});

export const getMyAchievements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_achievements")
      .select("code, unlocked_at")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data;
  });

// ============ Leaderboard ============

const LeaderboardInput = z.object({
  scope: z.enum(["global", "country", "state", "city"]).default("global"),
  scopeValue: z.string().optional(),
  timeframe: z.enum(["daily", "weekly", "monthly", "all"]).default("all"),
});

export const leaderboard = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => LeaderboardInput.parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    // All-time uses cached best_wpm on profile
    if (data.timeframe === "all") {
      let q = supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, country, state, city, best_wpm, level, xp, tests_completed",
        )
        .gt("best_wpm", 0)
        .eq("is_public", true)
        .order("best_wpm", { ascending: false })
        .limit(100);
      if (data.scope === "country" && data.scopeValue) q = q.eq("country", data.scopeValue);
      if (data.scope === "state" && data.scopeValue) q = q.eq("state", data.scopeValue);
      if (data.scope === "city" && data.scopeValue) q = q.eq("city", data.scopeValue);
      const { data: rows, error } = await q;
      if (error) throw new Error(error.message);
      return (rows ?? []).map((r, i) => ({ rank: i + 1, wpm: Number(r.best_wpm), ...r }));
    }

    // Timeframe: take MAX(wpm) per user since cutoff
    const now = new Date();
    const cutoff = new Date(now);
    if (data.timeframe === "daily") cutoff.setUTCHours(0, 0, 0, 0);
    else if (data.timeframe === "weekly") cutoff.setUTCDate(cutoff.getUTCDate() - 7);
    else if (data.timeframe === "monthly") cutoff.setUTCDate(cutoff.getUTCDate() - 30);

    const { data: results, error } = await supabase
      .from("typing_results")
      .select("user_id, wpm, accuracy")
      .gte("created_at", cutoff.toISOString())
      .order("wpm", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);

    const best = new Map<string, { wpm: number; accuracy: number }>();
    for (const r of results ?? []) {
      const cur = best.get(r.user_id);
      const w = Number(r.wpm);
      if (!cur || w > cur.wpm) best.set(r.user_id, { wpm: w, accuracy: Number(r.accuracy) });
    }
    if (best.size === 0) return [];
    let pq = supabase
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, country, state, city, level, xp, tests_completed",
      )
      .in("id", Array.from(best.keys()))
      .eq("is_public", true);
    if (data.scope === "country" && data.scopeValue) pq = pq.eq("country", data.scopeValue);
    if (data.scope === "state" && data.scopeValue) pq = pq.eq("state", data.scopeValue);
    if (data.scope === "city" && data.scopeValue) pq = pq.eq("city", data.scopeValue);
    const { data: profiles } = await pq;
    const ranked = (profiles ?? [])
      .map((p) => ({
        ...p,
        wpm: best.get(p.id)?.wpm ?? 0,
        accuracy: best.get(p.id)?.accuracy ?? 0,
      }))
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 100)
      .map((r, i) => ({ rank: i + 1, ...r }));
    return ranked;
  });

// ============ Heatmap ============

export const myHeatmap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - 364);
    const { data, error } = await context.supabase
      .from("typing_results")
      .select("created_at, wpm")
      .gte("created_at", cutoff.toISOString())
      .limit(5000);
    if (error) throw new Error(error.message);
    const byDate = new Map<string, { count: number; maxWpm: number }>();
    for (const r of data ?? []) {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      const cur = byDate.get(day) ?? { count: 0, maxWpm: 0 };
      cur.count += 1;
      cur.maxWpm = Math.max(cur.maxWpm, Number(r.wpm));
      byDate.set(day, cur);
    }
    return Array.from(byDate.entries()).map(([date, v]) => ({ date, ...v }));
  });

// ============ Certificates ============

const CertInput = z.object({
  wpm: z.number().nonnegative(),
  accuracy: z.number().min(0).max(100),
  cpm: z.number().nonnegative(),
  mode: z.string(),
  mode_value: z.number().int().nonnegative(),
  language: z.string().default("english"),
});

function randomCertId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) s += chars[Math.floor(Math.random() * chars.length)];
    if (i < 3) s += "-";
  }
  return s;
}

export const createCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CertInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: prof } = await context.supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", context.userId)
      .maybeSingle();
    const name = prof?.display_name || prof?.username || "Typist";
    const id = randomCertId();
    const { data: row, error } = await context.supabase
      .from("certificates")
      .insert({ id, user_id: context.userId, display_name: name, ...data })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getCertificate = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().trim().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", data.id.toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
