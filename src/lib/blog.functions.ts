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

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image, published_at, category_id")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: post, error } = await sb
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return null;
    const [author, category] = await Promise.all([
      post.author_id
        ? sb
            .from("blog_authors")
            .select("name, avatar_url, bio")
            .eq("id", post.author_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      post.category_id
        ? sb.from("blog_categories").select("name, slug").eq("id", post.category_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    return { ...post, author: author.data, category: category.data };
  });

// Admin: all posts
export const listAllPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, slug, title, status, published_at, updated_at, category_id, author_id")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const PostInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "lowercase, numbers and hyphens"),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(400).nullable().optional(),
  body_markdown: z.string().max(100000).default(""),
  cover_image: z.string().url().nullable().optional(),
  author_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
  og_image: z.string().url().nullable().optional(),
});

export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof PostInput>) => PostInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload: any = { ...data };
    if (data.status === "published") payload.published_at = new Date().toISOString();
    const { data: row, error } = data.id
      ? await supabaseAdmin.from("blog_posts").update(payload).eq("id", data.id).select().single()
      : await supabaseAdmin.from("blog_posts").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Categories
export const listBlogCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("blog_categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const upsertBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; slug: string; name: string; description?: string | null }) =>
    z
      .object({
        id: z.string().uuid().optional(),
        slug: z
          .string()
          .trim()
          .min(1)
          .max(60)
          .regex(/^[a-z0-9-]+$/),
        name: z.string().trim().min(1).max(80),
        description: z.string().max(280).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("blog_categories").update(data).eq("id", data.id)
      : await supabaseAdmin.from("blog_categories").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Authors
export const listBlogAuthors = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("blog_authors").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const upsertBlogAuthor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id?: string; name: string; bio?: string | null; avatar_url?: string | null }) =>
      z
        .object({
          id: z.string().uuid().optional(),
          name: z.string().trim().min(1).max(80),
          bio: z.string().max(400).nullable().optional(),
          avatar_url: z.string().url().nullable().optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("blog_authors").update(data).eq("id", data.id)
      : await supabaseAdmin.from("blog_authors").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBlogAuthor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_authors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
