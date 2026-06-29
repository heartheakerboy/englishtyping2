// Marketplace landing — searchable, filterable, grid/list, paginated.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard, TemplateListRow } from "@/components/templates/TemplateCard";
import { listPublicTemplates, listCategories } from "@/lib/templates.functions";
import { Grid3x3, List as ListIcon, Search, Plus, Sparkles } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional().default(""),
  category: z.string().optional().default(""),
  language: z.string().optional().default(""),
  difficulty: z.string().optional().default(""),
  duration: z.enum(["all", "short", "medium", "long"]).optional().default("all"),
  premium: z.enum(["all", "free", "premium"]).optional().default("all"),
  sort: z.enum(["popular", "new", "featured", "rating"]).optional().default("featured"),
  view: z.enum(["grid", "list"]).optional().default("grid"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export const Route = createFileRoute("/templates/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Template Marketplace — English Typing Test" },
      {
        name: "description",
        content:
          "Browse, preview and use thousands of typing-test templates from creators worldwide. SSC, Railway, Bank, coding, kids, quotes and more.",
      },
      { property: "og:title", content: "Typing Template Marketplace" },
      {
        property: "og:description",
        content:
          "Discover and use ready-made typing-test templates for exams, school, work and play.",
      },
      { property: "og:url", content: "/templates" },
    ],
    links: [{ rel: "canonical", href: "/templates" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Typing Template Marketplace",
          description: "Browse ready-made typing-test templates.",
          url: "/templates",
        }),
      },
    ],
  }),
  component: TemplatesIndex,
});

function TemplatesIndex() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/templates/" });
  const [searchInput, setSearchInput] = useState(search.q);

  const cats = useQuery({ queryKey: ["template-categories"], queryFn: () => listCategories() });
  const list = useQuery({
    queryKey: ["templates", search],
    queryFn: () =>
      listPublicTemplates({
        data: {
          search: search.q || "",
          category: search.category || null,
          language: search.language || null,
          difficulty: search.difficulty || null,
          duration: search.duration,
          premium: search.premium,
          sort: search.sort,
          page: search.page,
          pageSize: 24,
        },
      }),
  });

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: any) => ({ ...prev, ...patch, page: 1 }) });

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 24));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" /> Marketplace
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Typing Templates
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Ready-made typing tests for exams, schools, offices, coders and creators. Search,
                preview, and use in one click.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/templates/favorites">Favorites</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/templates/my">My templates</Link>
              </Button>
              <Button asChild className="bg-gradient-primary text-primary-foreground">
                <Link to="/templates/builder/$id" params={{ id: "new" }}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create
                </Link>
              </Button>
            </div>
          </header>

          {/* Filters */}
          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  update({ q: searchInput });
                }}
                className="relative min-w-[240px] flex-1"
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search templates…"
                  className="pl-9"
                />
              </form>
              <Select
                value={search.category || "all"}
                onValueChange={(v) => update({ category: v === "all" ? "" : v })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {(cats.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={search.difficulty || "all"}
                onValueChange={(v) => update({ difficulty: v === "all" ? "" : v })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={search.duration} onValueChange={(v: any) => update({ duration: v })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any length</SelectItem>
                  <SelectItem value="short">≤ 1 min</SelectItem>
                  <SelectItem value="medium">1–5 min</SelectItem>
                  <SelectItem value="long">5 min+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={search.premium} onValueChange={(v: any) => update({ premium: v })}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <Select value={search.sort} onValueChange={(v: any) => update({ sort: v })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="rating">Top rated</SelectItem>
                </SelectContent>
              </Select>
              <ToggleGroup
                type="single"
                value={search.view}
                onValueChange={(v) =>
                  v && navigate({ search: (p: any) => ({ ...p, view: v as any }) })
                }
              >
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Grid3x3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                  <ListIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Results */}
          {list.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[5/4] rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-border bg-surface/30 p-12 text-center">
              <Sparkles className="mb-2 h-8 w-8 text-primary/60" />
              <p className="font-display text-lg">No templates match these filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing or clearing the filters.
              </p>
              <Button
                className="mt-4"
                onClick={() =>
                  navigate({
                    search: () => ({
                      q: "",
                      category: "",
                      language: "",
                      difficulty: "",
                      duration: "all",
                      premium: "all",
                      sort: "featured",
                      view: search.view,
                      page: 1,
                    }),
                  })
                }
              >
                Clear filters
              </Button>
            </div>
          ) : search.view === "list" ? (
            <div className="grid gap-2">
              {items.map((t: any) => (
                <TemplateListRow key={t.id} tpl={t} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((t: any) => (
                <TemplateCard key={t.id} tpl={t} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                disabled={search.page <= 1}
                onClick={() => navigate({ search: (p: any) => ({ ...p, page: p.page - 1 }) })}
              >
                Previous
              </Button>
              <span className="grid place-items-center px-3 text-sm text-muted-foreground">
                Page {search.page} of {pages}
              </span>
              <Button
                variant="outline"
                disabled={search.page >= pages}
                onClick={() => navigate({ search: (p: any) => ({ ...p, page: p.page + 1 }) })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
