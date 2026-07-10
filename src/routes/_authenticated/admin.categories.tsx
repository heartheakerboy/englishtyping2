import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getPublicSettings, updateSetting } from "@/lib/cms.functions";
import { Badge } from "@/components/ui/badge";
import { Tag, ExternalLink } from "lucide-react";
import type { CategoryId } from "@/lib/categories";

const PRACTICE_CATEGORIES = [
  { id: "articles" as CategoryId, label: "Articles", description: "News-style paragraphs." },
  { id: "stories" as CategoryId, label: "Stories", description: "Short narrative prose." },
  { id: "books" as CategoryId, label: "Books", description: "Classic literature extracts." },
  { id: "quotes" as CategoryId, label: "Quotes", description: "Famous quotations." },
  { id: "coding" as CategoryId, label: "Code", description: "Snippets across languages." },
  { id: "numbers" as CategoryId, label: "Numbers", description: "Digit & numeric drills." },
  { id: "symbols" as CategoryId, label: "Symbols", description: "Punctuation & special chars." },
  { id: "gov-exams" as CategoryId, label: "Government", description: "Formal passages for exams." },
  { id: "lessons" as CategoryId, label: "Custom", description: "Saved drills and custom lessons." },
];

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getPublicSettings);
  const saveSetting = useServerFn(updateSetting);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => fetchSettings(),
  });

  const update = useMutation({
    mutationFn: ({ key, value }: { key: string; value: Record<string, boolean> }) =>
      saveSetting({ data: { key, value, is_public: true } }),
    onSuccess: () => {
      toast.success("Category settings updated");
      qc.invalidateQueries({ queryKey: ["public-settings"] });
    },
    onError: (e: unknown) => {
      const error = e as { message?: string } | null;
      toast.error(error?.message ?? "Failed to update category setting");
    },
  });

  const activeCategories = settings?.practice_categories ?? {};

  const handleToggle = (categoryId: CategoryId, checked: boolean) => {
    const updated = {
      ...activeCategories,
      [categoryId]: checked,
    };
    update.mutate({ key: "practice_categories", value: updated });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Practice Categories</h1>
        <p className="text-sm text-muted-foreground">
          Enable or disable built-in category taxonomy used across typing tests.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse border border-border bg-surface/50 p-4" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {PRACTICE_CATEGORIES.map((c) => {
            const isActive = activeCategories[c.id] !== false; // defaults to true
            return (
              <Card
                key={c.id}
                className="flex flex-col justify-between border border-border/50 bg-surface/40 p-5 shadow-elegant backdrop-blur-sm hover:border-border/80 transition-all duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Tag className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-foreground text-sm tracking-tight">
                        {c.label}
                      </span>
                    </div>
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-transparent"
                      }
                    >
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal min-h-[32px]">
                    {c.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`switch-${c.id}`}
                      checked={isActive}
                      onCheckedChange={(checked) => handleToggle(c.id, checked)}
                    />
                    <label
                      htmlFor={`switch-${c.id}`}
                      className="text-xs text-muted-foreground cursor-pointer select-none"
                    >
                      {isActive ? "Enabled" : "Disabled"}
                    </label>
                  </div>
                  <Link
                    to="/admin/texts"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    Manage texts
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
