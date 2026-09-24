import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function pub() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://placeholder-offline.supabase.co";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
async function requireAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("is_admin", { _user_id: ctx.userId });
  if (!data) throw new Error("Forbidden");
}

const DEFAULT_SECTIONS = [
  { id: "sec-practice", title: "Typing Practice", key: "practice", sort_order: 1 },
  { id: "sec-transparency", title: "Trust & Transparency", key: "trust", sort_order: 2 },
  { id: "sec-legal", title: "Legal & Support", key: "legal", sort_order: 3 },
];

const DEFAULT_LINKS = [
  { id: "l-test-60", section_id: "sec-practice", label: "60-Second Typing Test", href: "/test", sort_order: 1 },
  { id: "l-paragraph", section_id: "sec-practice", label: "Paragraph Practice", href: "/typing-test", sort_order: 2 },
  { id: "l-cgl", section_id: "sec-practice", label: "SSC CGL Typing Exam", href: "/ssc-cgl-typing-test", sort_order: 3 },
  { id: "l-gcc", section_id: "sec-practice", label: "GCC-TBC Typing Exam", href: "/gcc-tbc-typing-test", sort_order: 4 },
  { id: "l-games", section_id: "sec-practice", label: "Speed & Reflex Games", href: "/games", sort_order: 5 },

  { id: "l-about", section_id: "sec-transparency", label: "About Us", href: "/about", sort_order: 1 },
  { id: "l-methodology", section_id: "sec-transparency", label: "Measurement Methodology", href: "/methodology", sort_order: 2 },
  { id: "l-editorial", section_id: "sec-transparency", label: "Editorial Policy", href: "/editorial-policy", sort_order: 3 },
  { id: "l-report", section_id: "sec-transparency", label: "Report an Error", href: "/report-error", sort_order: 4 },

  { id: "l-privacy", section_id: "sec-legal", label: "Privacy Policy", href: "/privacy", sort_order: 1 },
  { id: "l-terms", section_id: "sec-legal", label: "Terms of Service", href: "/terms", sort_order: 2 },
  { id: "l-contact", section_id: "sec-legal", label: "Contact Us", href: "/contact", sort_order: 3 },
];

const DEFAULT_FOOTER = {
  sections: DEFAULT_SECTIONS,
  links: DEFAULT_LINKS,
  legalPages: [],
  brand: {
    name: "English Typing Test",
    description: "Free, privacy-focused typing tests and real-time keystroke analytics for students, professionals, and exam candidates.",
    logo: "",
  },
  bottom: {
    copyright: "All rights reserved.",
    company: "English Typing Test",
    version: "1.0.0",
    build: "",
  },
};

// ---------- PUBLIC ----------
export const getFooterData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sb = pub();
    if (!sb) return DEFAULT_FOOTER;
    const [{ data: sections }, { data: links }, { data: legal }, { data: settings }] =
      await Promise.all([
        sb
          .from("footer_sections" as any)
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),
        sb
          .from("footer_links" as any)
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),
        sb
          .from("legal_pages" as any)
          .select("slug,title,sort_order,show_in_footer")
          .eq("status", "published")
          .eq("show_in_footer", true)
          .order("sort_order"),
        sb
          .from("site_settings")
          .select("key,value")
          .eq("is_public", true)
          .in("key", ["footer_brand", "footer_bottom"]),
      ]);
    const settingsMap: Record<string, any> = {};
    (settings ?? []).forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

    const hasDbSections = Array.isArray(sections) && sections.length > 0;
    const finalSections = hasDbSections ? sections : DEFAULT_SECTIONS;
    const finalLinks = hasDbSections ? (links ?? []) : DEFAULT_LINKS;

    return {
      sections: finalSections as any[],
      links: finalLinks as any[],
      legalPages: (legal ?? []) as any[],
      brand: settingsMap.footer_brand ?? DEFAULT_FOOTER.brand,
      bottom: settingsMap.footer_bottom ?? DEFAULT_FOOTER.bottom,
    };
  } catch {
    return DEFAULT_FOOTER;
  }
});

export const getLegalPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = pub();
    const { data: page, error } = await sb
      .from("legal_pages" as any)
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return page as any;
  });

export const listPublishedLegalSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = pub();
  const { data } = await sb
    .from("legal_pages" as any)
    .select("slug,updated_at")
    .eq("status", "published");
  return (data ?? []) as unknown as Array<{ slug: string; updated_at: string }>;
});

// ---------- ADMIN: SECTIONS ----------
export const listFooterSectionsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("footer_sections" as any)
      .select("*")
      .order("sort_order");
    return (data ?? []) as any[];
  });

const SectionInput = z.object({
  id: z.string().uuid().optional(),
  key: z.string().min(1).max(40),
  title: z.string().min(1).max(80),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});
export const upsertFooterSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof SectionInput>) => SectionInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin
          .from("footer_sections" as any)
          .update(data)
          .eq("id", data.id)
      : await supabaseAdmin.from("footer_sections" as any).insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFooterSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("footer_sections" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderFooterSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[] }) => z.object({ ids: z.array(z.string().uuid()) }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all(
      data.ids.map((id, i) =>
        supabaseAdmin
          .from("footer_sections" as any)
          .update({ sort_order: i })
          .eq("id", id),
      ),
    );
    return { ok: true };
  });

// ---------- ADMIN: LINKS ----------
export const listFooterLinksAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("footer_links" as any)
      .select("*")
      .order("sort_order");
    return (data ?? []) as any[];
  });

const LinkInput = z.object({
  id: z.string().uuid().optional(),
  section_id: z.string().uuid(),
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(500),
  icon: z.string().max(40).nullable().optional(),
  open_in_new_tab: z.boolean().default(false),
  rel: z.string().max(60).nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});
export const upsertFooterLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof LinkInput>) => LinkInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin
          .from("footer_links" as any)
          .update(data)
          .eq("id", data.id)
      : await supabaseAdmin.from("footer_links" as any).insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFooterLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("footer_links" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderFooterLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[] }) => z.object({ ids: z.array(z.string().uuid()) }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all(
      data.ids.map((id, i) =>
        supabaseAdmin
          .from("footer_links" as any)
          .update({ sort_order: i })
          .eq("id", id),
      ),
    );
    return { ok: true };
  });

// ---------- ADMIN: LEGAL PAGES ----------
export const listLegalPagesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("legal_pages" as any)
      .select("*")
      .order("sort_order");
    return (data ?? []) as any[];
  });

const LegalInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "lowercase, numbers, dashes only"),
  title: z.string().min(1).max(200),
  content: z.string().default(""),
  format: z.enum(["markdown", "html"]).default("markdown"),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  publish_at: z.string().nullable().optional(),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(400).nullable().optional(),
  og_image: z.string().max(500).nullable().optional(),
  schema_jsonld: z.any().nullable().optional(),
  canonical_url: z.string().max(500).nullable().optional(),
  robots: z.string().max(60).nullable().optional(),
  breadcrumbs: z.any().nullable().optional(),
  show_in_footer: z.boolean().default(true),
  show_in_nav: z.boolean().default(false),
  attachments: z.any().nullable().optional(),
  sort_order: z.number().int().default(0),
});
export const upsertLegalPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof LegalInput>) => LegalInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { data: prev } = await supabaseAdmin
        .from("legal_pages" as any)
        .select("*")
        .eq("id", data.id)
        .maybeSingle();
      if (prev) {
        await supabaseAdmin.from("legal_page_versions" as any).insert({
          page_id: data.id,
          title: (prev as any).title,
          content: (prev as any).content,
          snapshot: prev as any,
          created_by: context.userId,
        });
      }
      const { error } = await supabaseAdmin
        .from("legal_pages" as any)
        .update({ ...data, updated_by: context.userId })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin
      .from("legal_pages" as any)
      .insert({ ...data, updated_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: (ins as any).id };
  });

export const deleteLegalPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("legal_pages" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listLegalVersions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pageId: string }) => z.object({ pageId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("legal_page_versions" as any)
      .select("*")
      .eq("page_id", data.pageId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (rows ?? []) as any[];
  });

export const restoreLegalVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { versionId: string }) => z.object({ versionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: v } = await supabaseAdmin
      .from("legal_page_versions" as any)
      .select("*")
      .eq("id", data.versionId)
      .single();
    if (!v) throw new Error("Version not found");
    const vv = v as any;
    await supabaseAdmin
      .from("legal_pages" as any)
      .update({ title: vv.title, content: vv.content, updated_by: context.userId })
      .eq("id", vv.page_id);
    return { ok: true };
  });
