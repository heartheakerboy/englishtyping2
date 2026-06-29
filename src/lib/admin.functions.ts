import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("is_admin", { _user_id: ctx.userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    return { isAdmin: !!data };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, tests, posts, payments, subs, rooms] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("typing_results")
        .select("id, wpm, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(1000),
      supabaseAdmin.from("blog_posts").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("payments")
        .select("amount_cents, currency, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("subscriptions").select("plan", { count: "exact" }),
      supabaseAdmin.from("rooms").select("id", { count: "exact", head: true }),
    ]);
    const revenueCents = (payments.data ?? []).reduce(
      (sum: number, p: any) => sum + (p.amount_cents ?? 0),
      0,
    );
    const avgWpm =
      tests.data && tests.data.length
        ? Math.round(
            tests.data.reduce((s: number, t: any) => s + (t.wpm || 0), 0) / tests.data.length,
          )
        : 0;
    const premiumCount = (subs.data ?? []).filter((s: any) => s.plan === "premium").length;
    return {
      users: users.count ?? 0,
      tests: tests.count ?? 0,
      posts: posts.count ?? 0,
      rooms: rooms.count ?? 0,
      revenueCents,
      avgWpm,
      premiumCount,
      recentPayments: payments.data ?? [],
      recentTests: tests.data ?? [],
    };
  });

export const listUsersAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { search?: string; limit?: number }) => ({
    search: d?.search ?? "",
    limit: d?.limit ?? 50,
  }))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, xp, level, tests_completed, best_wpm, country, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.search)
      q = q.or(`username.ilike.%${data.search}%,display_name.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "admin" | "editor" | "user"; grant: boolean }) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["admin", "editor", "user"]),
        grant: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: data.role });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const listAllPaymentsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select(
        "id, user_id, amount_cents, currency, status, provider, description, invoice_url, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listSubscriptionsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, plan, status, provider, current_period_end, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listReportsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateReportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "open" | "resolved" | "dismissed" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "resolved", "dismissed"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("reports")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listCertificatesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .order("issued_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminLeaderboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, display_name, best_wpm, country, level")
      .order("best_wpm", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const exportTableCSV = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      table:
        "profiles" | "typing_results" | "payments" | "subscriptions" | "newsletter_subscribers";
    }) =>
      z
        .object({
          table: z.enum([
            "profiles",
            "typing_results",
            "payments",
            "subscriptions",
            "newsletter_subscribers",
          ]),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from(data.table).select("*").limit(5000);
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return { csv: "", count: 0 };
    const headers = Object.keys(rows[0]);
    const escape = (v: any) => {
      if (v == null) return "";
      const s = typeof v === "string" ? v : JSON.stringify(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...rows.map((r: any) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\n");
    return { csv, count: rows.length };
  });
