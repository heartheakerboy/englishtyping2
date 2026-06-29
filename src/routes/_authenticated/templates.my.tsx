// Creator's own templates dashboard.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  myTemplates,
  deleteTemplate,
  duplicateTemplate,
  setTemplateStatus,
  exportTemplateJson,
  importTemplateJson,
} from "@/lib/templates.functions";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  Archive,
  FileDown,
  FileUp,
  Send,
  Pause,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/templates/my")({ component: MyTemplates });

function MyTemplates() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["my-templates"], queryFn: () => myTemplates() });
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["my-templates"] });

  const del = useMutation({
    mutationFn: (id: string) => deleteTemplate({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      refresh();
    },
  });
  const dup = useMutation({
    mutationFn: (id: string) => duplicateTemplate({ data: { id } }),
    onSuccess: () => {
      toast.success("Duplicated");
      refresh();
    },
  });
  const status = useMutation({
    mutationFn: ({ id, s }: { id: string; s: "published" | "archived" | "draft" }) =>
      setTemplateStatus({ data: { id, status: s } }),
    onSuccess: (r: any) => {
      toast.success(r.status === "pending" ? "Submitted for review" : `Marked ${r.status}`);
      refresh();
    },
  });
  const exportOne = useMutation({
    mutationFn: (id: string) => exportTemplateJson({ data: { id } }),
    onSuccess: (r: any) => {
      const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${r.slug || "template"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
  const importOne = useMutation({
    mutationFn: (payload: Record<string, any>) => importTemplateJson({ data: { payload } }),
    onSuccess: (r: any) => {
      toast.success("Imported");
      refresh();
      if (r?.id) navigate({ to: "/templates/builder/$id", params: { id: r.id } });
    },
    onError: (e: any) => toast.error(e?.message ?? "Import failed"),
  });

  const items = list.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            My templates
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} templates · drafts, published & archived.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                importOne.mutate(JSON.parse(text));
              } catch {
                toast.error("Invalid JSON");
              }
              e.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <FileUp className="mr-1 h-4 w-4" /> Import JSON
          </Button>
          <Button asChild>
            <Link to="/templates">
              <Eye className="mr-1 h-4 w-4" /> Marketplace
            </Link>
          </Button>
          <Button asChild className="bg-gradient-primary text-primary-foreground">
            <Link to="/templates/builder/$id" params={{ id: "new" }}>
              <Plus className="mr-1 h-4 w-4" /> New template
            </Link>
          </Button>
        </div>
      </header>

      {list.isLoading ? (
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="mt-8 grid place-items-center p-12 text-center">
          <p className="font-display text-lg">You haven't created any templates yet</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Use the builder to create reusable typing tests. Generate with AI in seconds.
          </p>
          <Button className="mt-4 bg-gradient-primary text-primary-foreground" asChild>
            <Link to="/templates/builder/$id" params={{ id: "new" }}>
              <Plus className="mr-1 h-4 w-4" /> Create my first template
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((t: any) => (
            <Card key={t.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-primary/20 to-transparent">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} className="h-full w-full object-cover" alt="" />
                ) : (
                  <div className="grid h-full place-items-center text-lg text-primary/40">
                    {t.name?.[0] ?? "T"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display font-semibold">{t.name}</h3>
                  <Badge
                    variant={t.status === "published" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {t.status}
                  </Badge>
                  {t.visibility !== "public" && (
                    <Badge variant="outline" className="capitalize">
                      {t.visibility}
                    </Badge>
                  )}
                  {t.is_premium && <Badge className="bg-amber-500/90 text-black">Premium</Badge>}
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">{t.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.uses_count ?? 0} uses · {t.favorites_count ?? 0} favorites · ⭐{" "}
                  {Number(t.rating_avg ?? 0).toFixed(1)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/templates/builder/$id" params={{ id: t.id }}>
                    Edit
                  </Link>
                </Button>
                {t.status !== "published" ? (
                  <Button size="sm" onClick={() => status.mutate({ id: t.id, s: "published" })}>
                    <Send className="mr-1 h-4 w-4" /> Publish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => status.mutate({ id: t.id, s: "draft" })}
                  >
                    <Pause className="mr-1 h-4 w-4" /> Unpublish
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/templates/$slug" params={{ slug: t.slug }}>
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => dup.mutate(t.id)}>
                      <Copy className="mr-2 h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportOne.mutate(t.id)}>
                      <FileDown className="mr-2 h-4 w-4" /> Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => status.mutate({ id: t.id, s: "archived" })}>
                      <Archive className="mr-2 h-4 w-4" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => confirm("Delete this template?") && del.mutate(t.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
