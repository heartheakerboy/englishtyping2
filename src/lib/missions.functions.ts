import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { keyForScope } from "@/lib/period";

type Scope = "daily" | "weekly" | "monthly";

export const listMissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: missions, error } = await context.supabase
      .from("missions")
      .select("*")
      .eq("active", true);
    if (error) throw new Error(error.message);
    const periodKeys = (["daily", "weekly", "monthly"] as Scope[]).reduce(
      (acc, s) => {
        acc[s] = keyForScope(s);
        return acc;
      },
      {} as Record<Scope, string>,
    );
    const { data: progress } = await context.supabase
      .from("user_missions")
      .select("*")
      .eq("user_id", context.userId)
      .in("period_key", Object.values(periodKeys));
    type UM = NonNullable<typeof progress>[number];
    const progMap = new Map<string, UM>();
    return (missions ?? []).map((m) => {
      const key = periodKeys[m.scope as Scope];
      const p = progMap.get(`${m.id}:${key}`);
      return {
        ...m,
        period_key: key,
        progress: p?.progress ?? 0,
        completed: p?.completed ?? false,
        claimed: p?.claimed ?? false,
      };
    });
  });

// Tick missions after a typing test result. Called from client after save succeeds.
const TickInput = z.object({
  wpm: z.number().min(0).max(400),
  accuracy: z.number().min(0).max(100),
});

export const tickTestMissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TickInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: missions } = await context.supabase
      .from("missions")
      .select("id, code, scope, metric, threshold")
      .eq("active", true);
    const now = new Date();
    const completed: string[] = [];

    for (const m of missions ?? []) {
      const scope = m.scope as Scope;
      const periodKey = keyForScope(scope, now);
      const { data: existing } = await context.supabase
        .from("user_missions")
        .select("*")
        .eq("user_id", context.userId)
        .eq("mission_id", m.id)
        .eq("period_key", periodKey)
        .maybeSingle();

      let progress = existing?.progress ?? 0;
      let isComplete = existing?.completed ?? false;

      if (m.metric === "tests") {
        progress = Math.min(m.threshold, progress + 1);
        if (progress >= m.threshold) isComplete = true;
      } else if (m.metric === "wpm") {
        if (data.wpm >= m.threshold) {
          progress = m.threshold;
          isComplete = true;
        }
      } else if (m.metric === "accuracy") {
        if (data.accuracy >= m.threshold) {
          progress = m.threshold;
          isComplete = true;
        }
      } else {
        continue;
      }

      const payload = {
        user_id: context.userId,
        mission_id: m.id,
        period_key: periodKey,
        progress,
        completed: isComplete,
        completed_at: isComplete ? (existing?.completed_at ?? now.toISOString()) : null,
      };
      await context.supabase
        .from("user_missions")
        .upsert(payload, { onConflict: "user_id,mission_id,period_key" });

      if (isComplete && !existing?.completed) completed.push(m.code);
    }
    return { completed };
  });

export const tickRaceWin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: missions } = await context.supabase
      .from("missions")
      .select("id, scope, threshold")
      .eq("metric", "race_wins")
      .eq("active", true);
    for (const m of missions ?? []) {
      const periodKey = keyForScope(m.scope as Scope);
      const { data: existing } = await context.supabase
        .from("user_missions")
        .select("*")
        .eq("user_id", context.userId)
        .eq("mission_id", m.id)
        .eq("period_key", periodKey)
        .maybeSingle();
      const progress = Math.min(m.threshold, (existing?.progress ?? 0) + 1);
      const completed = progress >= m.threshold;
      await context.supabase.from("user_missions").upsert(
        {
          user_id: context.userId,
          mission_id: m.id,
          period_key: periodKey,
          progress,
          completed,
          completed_at: completed ? (existing?.completed_at ?? new Date().toISOString()) : null,
        },
        { onConflict: "user_id,mission_id,period_key" },
      );
    }
    return { ok: true };
  });

export const claimMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ mission_id: z.string().uuid(), period_key: z.string().min(4) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("user_missions")
      .select("*")
      .eq("user_id", context.userId)
      .eq("mission_id", data.mission_id)
      .eq("period_key", data.period_key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || !row.completed) throw new Error("Mission not completed yet");
    if (row.claimed) throw new Error("Already claimed");

    const { data: mission } = await context.supabase
      .from("missions")
      .select("xp_reward, coin_reward, title")
      .eq("id", data.mission_id)
      .maybeSingle();
    if (!mission) throw new Error("Mission not found");

    await context.supabase
      .from("user_missions")
      .update({ claimed: true, claimed_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .eq("mission_id", data.mission_id)
      .eq("period_key", data.period_key);

    const { data: prof } = await context.supabase
      .from("profiles")
      .select("xp, coins")
      .eq("id", context.userId)
      .maybeSingle();
    const newXp = (prof?.xp ?? 0) + mission.xp_reward;
    await context.supabase
      .from("profiles")
      .update({
        xp: newXp,
        coins: (prof?.coins ?? 0) + mission.coin_reward,
        level: 1 + Math.floor(Math.sqrt(newXp / 100)),
      })
      .eq("id", context.userId);

    await context.supabase.from("notifications").insert({
      user_id: context.userId,
      type: "mission_reward",
      title: "Mission reward claimed",
      body: `+${mission.xp_reward} XP, +${mission.coin_reward} coins — ${mission.title}`,
    });

    return { xp: mission.xp_reward, coins: mission.coin_reward };
  });
