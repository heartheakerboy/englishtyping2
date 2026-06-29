import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { generateWordsForLanguage, type LanguageCode } from "@/lib/languages";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function randomCode(len = 6) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

// ===== Public listing =====
export const listPublicRooms = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data: rooms, error } = await sb
    .from("rooms")
    .select(
      "id, code, name, visibility, ranked, language, status, max_players, host_id, created_at",
    )
    .eq("visibility", "public")
    .in("status", ["waiting", "countdown", "racing"])
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw new Error(error.message);
  const ids = (rooms ?? []).map((r) => r.id);
  const { data: members } = ids.length
    ? await sb.from("room_members").select("room_id, user_id, is_spectator").in("room_id", ids)
    : { data: [] as { room_id: string; user_id: string; is_spectator: boolean }[] };
  const counts = new Map<string, { players: number; spectators: number }>();
  for (const m of members ?? []) {
    const c = counts.get(m.room_id) ?? { players: 0, spectators: 0 };
    if (m.is_spectator) c.spectators++;
    else c.players++;
    counts.set(m.room_id, c);
  }
  return (rooms ?? []).map((r) => ({
    ...r,
    ...(counts.get(r.id) ?? { players: 0, spectators: 0 }),
  }));
});

export const getRoomByCode = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ code: z.string().trim().min(1).max(12) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const code = data.code.toUpperCase();
    const { data: room, error } = await sb.from("rooms").select("*").eq("code", code).maybeSingle();
    if (error) throw new Error(error.message);
    if (!room) return null;
    const { data: members } = await sb
      .from("room_members")
      .select(
        "user_id, display_name, avatar_url, is_spectator, progress, wpm, accuracy, finished_at, finish_rank, joined_at",
      )
      .eq("room_id", room.id)
      .order("joined_at", { ascending: true });
    return { room, members: members ?? [] };
  });

// ===== Create room =====
const CreateInput = z.object({
  name: z.string().trim().min(1).max(40).default("Race"),
  visibility: z.enum(["public", "private"]).default("public"),
  ranked: z.boolean().default(false),
  language: z.string().trim().min(1).max(16).default("english"),
  word_count: z.number().int().min(15).max(120).default(40),
  max_players: z.number().int().min(2).max(12).default(6),
});

export const createRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const text = generateWordsForLanguage(data.word_count, data.language as LanguageCode);
    let code = randomCode();
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data: row, error } = await context.supabase
        .from("rooms")
        .insert({
          code,
          name: data.name,
          visibility: data.visibility,
          ranked: data.ranked,
          language: data.language,
          text,
          max_players: data.max_players,
          host_id: context.userId,
        })
        .select()
        .single();
      if (!error && row) {
        // auto-join host
        const { data: prof } = await context.supabase
          .from("profiles")
          .select("display_name, avatar_url, username")
          .eq("id", context.userId)
          .maybeSingle();
        await context.supabase.from("room_members").insert({
          room_id: row.id,
          user_id: context.userId,
          display_name: prof?.display_name ?? prof?.username ?? "Player",
          avatar_url: prof?.avatar_url ?? null,
        });
        return row;
      }
      if (error && !error.message.toLowerCase().includes("duplicate"))
        throw new Error(error.message);
      code = randomCode();
    }
    throw new Error("Could not allocate room code");
  });

// ===== Join / leave =====
const JoinInput = z.object({
  code: z.string().trim().min(1).max(12),
  spectator: z.boolean().default(false),
});

export const joinRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => JoinInput.parse(d))
  .handler(async ({ data, context }) => {
    const code = data.code.toUpperCase();
    const { data: room, error: re } = await context.supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (re) throw new Error(re.message);
    if (!room) throw new Error("Room not found");

    const { data: members } = await context.supabase
      .from("room_members")
      .select("user_id, is_spectator")
      .eq("room_id", room.id);
    const racers = (members ?? []).filter((m) => !m.is_spectator);
    const already = (members ?? []).find((m) => m.user_id === context.userId);
    let spectator = data.spectator;
    if (
      !already &&
      !spectator &&
      (racers.length >= room.max_players || room.status === "racing" || room.status === "finished")
    ) {
      spectator = true;
    }

    const { data: prof } = await context.supabase
      .from("profiles")
      .select("display_name, avatar_url, username")
      .eq("id", context.userId)
      .maybeSingle();

    const payload = {
      room_id: room.id,
      user_id: context.userId,
      display_name: prof?.display_name ?? prof?.username ?? "Player",
      avatar_url: prof?.avatar_url ?? null,
      is_spectator: spectator,
      progress: 0,
      wpm: 0,
      accuracy: 0,
    };

    const { error: ue } = await context.supabase
      .from("room_members")
      .upsert(payload, { onConflict: "room_id,user_id" });
    if (ue) throw new Error(ue.message);
    return { room, spectator };
  });

export const leaveRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ room_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("room_members")
      .delete()
      .eq("room_id", data.room_id)
      .eq("user_id", context.userId);
    return { ok: true };
  });

// ===== Race lifecycle =====
export const startRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ room_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: room, error } = await context.supabase
      .from("rooms")
      .select("host_id, status")
      .eq("id", data.room_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!room) throw new Error("Room not found");
    if (room.host_id !== context.userId) throw new Error("Only host can start");
    const startAt = new Date(Date.now() + 5000).toISOString();
    await context.supabase
      .from("rooms")
      .update({ status: "countdown", starts_at: startAt })
      .eq("id", data.room_id);
    // After 5s the client transitions to "racing"; flip server too for late joiners.
    return { starts_at: startAt };
  });

export const beginRace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ room_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("rooms")
      .update({ status: "racing", started_at: new Date().toISOString() })
      .eq("id", data.room_id)
      .eq("host_id", context.userId);
    return { ok: true };
  });

const ProgressInput = z.object({
  room_id: z.string().uuid(),
  progress: z.number().int().min(0).max(100),
  wpm: z.number().min(0).max(400),
  accuracy: z.number().min(0).max(100),
  finished: z.boolean().default(false),
});

export const updateProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProgressInput.parse(d))
  .handler(async ({ data, context }) => {
    const patch: {
      progress: number;
      wpm: number;
      accuracy: number;
      finished_at?: string;
      finish_rank?: number;
    } = { progress: data.progress, wpm: data.wpm, accuracy: data.accuracy };
    if (data.finished) {
      patch.finished_at = new Date().toISOString();
      const { count } = await context.supabase
        .from("room_members")
        .select("user_id", { count: "exact", head: true })
        .eq("room_id", data.room_id)
        .not("finished_at", "is", null);
      patch.finish_rank = (count ?? 0) + 1;
    }
    const { error } = await context.supabase
      .from("room_members")
      .update(patch)
      .eq("room_id", data.room_id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);

    if (data.finished) {
      // If all racers are done, close the room.
      const { data: rm } = await context.supabase
        .from("room_members")
        .select("is_spectator, finished_at")
        .eq("room_id", data.room_id);
      const racers = (rm ?? []).filter((m) => !m.is_spectator);
      const allDone = racers.length > 0 && racers.every((m) => m.finished_at);
      if (allDone) {
        await context.supabase
          .from("rooms")
          .update({ status: "finished", finished_at: new Date().toISOString() })
          .eq("id", data.room_id);
      }
    }
    return { ok: true };
  });

// ===== Quick match =====
export const quickMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ ranked: z.boolean().default(false), language: z.string().default("english") })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    // Find a waiting public room with capacity, same ranked/language.
    const { data: candidates } = await context.supabase
      .from("rooms")
      .select("id, code, max_players")
      .eq("visibility", "public")
      .eq("status", "waiting")
      .eq("ranked", data.ranked)
      .eq("language", data.language)
      .order("created_at", { ascending: true })
      .limit(10);
    for (const r of candidates ?? []) {
      const { count } = await context.supabase
        .from("room_members")
        .select("user_id", { count: "exact", head: true })
        .eq("room_id", r.id)
        .eq("is_spectator", false);
      if ((count ?? 0) < r.max_players) return { code: r.code };
    }
    // Fallback: create a new one.
    const text = generateWordsForLanguage(40, data.language as LanguageCode);
    let code = randomCode();
    const { data: row, error } = await context.supabase
      .from("rooms")
      .insert({
        code,
        name: data.ranked ? "Ranked Match" : "Quick Match",
        visibility: "public",
        ranked: data.ranked,
        language: data.language,
        text,
        max_players: 6,
        host_id: context.userId,
      })
      .select()
      .single();
    if (error || !row) throw new Error(error?.message || "Could not start match");
    const { data: prof } = await context.supabase
      .from("profiles")
      .select("display_name, avatar_url, username")
      .eq("id", context.userId)
      .maybeSingle();
    await context.supabase.from("room_members").insert({
      room_id: row.id,
      user_id: context.userId,
      display_name: prof?.display_name ?? prof?.username ?? "Player",
      avatar_url: prof?.avatar_url ?? null,
    });
    return { code: row.code };
  });
