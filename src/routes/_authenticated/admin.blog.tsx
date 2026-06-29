import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listAllPostsAdmin,
  upsertPost,
  deletePost,
  listBlogAuthors,
  listBlogCategories,
  upsertBlogAuthor,
  upsertBlogCategory,
  deleteBlogAuthor,
  deleteBlogCategory,
} from "@/lib/blog.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin/blog")({ component: BlogAdmin });

function BlogAdmin() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
        <p className="text-sm text-muted-foreground">
          Markdown posts with categories, authors, and SEO metadata.
        </p>
      </header>
      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-4">
          <PostsTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="authors" className="mt-4">
          <AuthorsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type PostForm = {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body_markdown: string;
  cover_image?: string | null;
  author_id?: string | null;
  category_id?: string | null;
  status: "draft" | "published";
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
};

function PostsTab() {
  const list = useServerFn(listAllPostsAdmin);
  const save = useServerFn(upsertPost);
  const del = useServerFn(deletePost);
  const listCats = useServerFn(listBlogCategories);
  const listAuthors = useServerFn(listBlogAuthors);
  const { data, refetch } = useQuery({ queryKey: ["admin-posts"], queryFn: () => list() });
  const cats = useQuery({ queryKey: ["blog-cats"], queryFn: () => listCats() });
  const authors = useQuery({ queryKey: ["blog-authors"], queryFn: () => listAuthors() });
  const [edit, setEdit] = useState<PostForm | null>(null);

  async function onSave(p: PostForm) {
    try {
      await save({ data: p as any });
      toast.success("Saved");
      setEdit(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onDel(id: string) {
    if (!confirm("Delete post?")) return;
    try {
      await del({ data: { id } });
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          onClick={() => setEdit({ slug: "", title: "", body_markdown: "", status: "draft" })}
        >
          New post
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Updated</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 font-mono text-xs">/{p.slug}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">{new Date(p.updated_at).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="text-primary hover:underline mr-3 text-xs"
                  >
                    Preview
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => setEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-2" onClick={() => onDel(p.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={5} className="p-4 text-muted-foreground">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Edit post" : "New post"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Title"
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
              <Input
                placeholder="slug-here"
                value={edit.slug}
                onChange={(e) => setEdit({ ...edit, slug: e.target.value.toLowerCase() })}
              />
              <Textarea
                className="col-span-2"
                placeholder="Excerpt"
                value={edit.excerpt ?? ""}
                onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })}
              />
              <Textarea
                className="col-span-2 min-h-60 font-mono text-xs"
                placeholder="# Markdown body"
                value={edit.body_markdown}
                onChange={(e) => setEdit({ ...edit, body_markdown: e.target.value })}
              />
              <Input
                placeholder="Cover image URL"
                value={edit.cover_image ?? ""}
                onChange={(e) => setEdit({ ...edit, cover_image: e.target.value || null })}
              />
              <Input
                placeholder="OG image URL"
                value={edit.og_image ?? ""}
                onChange={(e) => setEdit({ ...edit, og_image: e.target.value || null })}
              />
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={edit.author_id ?? ""}
                onChange={(e) => setEdit({ ...edit, author_id: e.target.value || null })}
              >
                <option value="">— No author —</option>
                {(authors.data ?? []).map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={edit.category_id ?? ""}
                onChange={(e) => setEdit({ ...edit, category_id: e.target.value || null })}
              >
                <option value="">— No category —</option>
                {(cats.data ?? []).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="SEO title"
                value={edit.seo_title ?? ""}
                onChange={(e) => setEdit({ ...edit, seo_title: e.target.value || null })}
              />
              <Input
                placeholder="SEO description"
                value={edit.seo_description ?? ""}
                onChange={(e) => setEdit({ ...edit, seo_description: e.target.value || null })}
              />
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm col-span-2"
                value={edit.status}
                onChange={(e) =>
                  setEdit({ ...edit, status: e.target.value as "draft" | "published" })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <div className="col-span-2 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEdit(null)}>
                  Cancel
                </Button>
                <Button onClick={() => onSave(edit)}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoriesTab() {
  const list = useServerFn(listBlogCategories);
  const save = useServerFn(upsertBlogCategory);
  const del = useServerFn(deleteBlogCategory);
  const { data, refetch } = useQuery({ queryKey: ["blog-cats"], queryFn: () => list() });
  const [edit, setEdit] = useState<{
    id?: string;
    slug: string;
    name: string;
    description?: string | null;
  } | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setEdit({ slug: "", name: "" })}>New category</Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="p-3">{c.name}</td>
                <td className="p-3 font-mono text-xs">{c.slug}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setEdit(c)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2"
                    onClick={async () => {
                      await del({ data: { id: c.id } });
                      refetch();
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={3} className="p-4 text-muted-foreground">
                  No categories.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Edit" : "New"} category</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <Input
                placeholder="Name"
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
              <Input
                placeholder="slug"
                value={edit.slug}
                onChange={(e) => setEdit({ ...edit, slug: e.target.value.toLowerCase() })}
              />
              <Textarea
                placeholder="Description"
                value={edit.description ?? ""}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEdit(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await save({ data: edit });
                      toast.success("Saved");
                      setEdit(null);
                      refetch();
                    } catch (e: any) {
                      toast.error(e.message);
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuthorsTab() {
  const list = useServerFn(listBlogAuthors);
  const save = useServerFn(upsertBlogAuthor);
  const del = useServerFn(deleteBlogAuthor);
  const { data, refetch } = useQuery({ queryKey: ["blog-authors"], queryFn: () => list() });
  const [edit, setEdit] = useState<{
    id?: string;
    name: string;
    bio?: string | null;
    avatar_url?: string | null;
  } | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setEdit({ name: "" })}>New author</Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Bio</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((a: any) => (
              <tr key={a.id} className="border-t border-border/40">
                <td className="p-3">{a.name}</td>
                <td className="p-3 text-muted-foreground line-clamp-1">{a.bio}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setEdit(a)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2"
                    onClick={async () => {
                      await del({ data: { id: a.id } });
                      refetch();
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={3} className="p-4 text-muted-foreground">
                  No authors.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Edit" : "New"} author</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <Input
                placeholder="Name"
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
              <Input
                placeholder="Avatar URL"
                value={edit.avatar_url ?? ""}
                onChange={(e) => setEdit({ ...edit, avatar_url: e.target.value || null })}
              />
              <Textarea
                placeholder="Bio"
                value={edit.bio ?? ""}
                onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEdit(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await save({ data: edit });
                      toast.success("Saved");
                      setEdit(null);
                      refetch();
                    } catch (e: any) {
                      toast.error(e.message);
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
