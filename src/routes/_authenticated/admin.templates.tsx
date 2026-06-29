// Admin moderation for the Template Marketplace.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { adminListTemplates, adminUpdateTemplate } from "@/lib/templates.functions";
import { Eye, ShieldCheck, ShieldX, Pin, Star, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/templates")({
  component: AdminTemplates,
});

function AdminTemplates() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const list = useQuery({
    queryKey: ["admin-templates", statusFilter],
    queryFn: () =>
      adminListTemplates({ data: { status: statusFilter === "all" ? undefined : statusFilter } }),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      adminUpdateTemplate({ data: { id, patch } }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-templates"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Update failed"),
  });

  const rows = (list.data ?? []).filter(
    (r: any) => !search || r.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Template marketplace</h1>
          <p className="text-sm text-muted-foreground">
            Moderate, feature, pin and publish templates submitted by creators.
          </p>
        </div>
        <Button asChild>
          <Link to="/templates/builder/$id" params={{ id: "new" }}>
            <Plus className="mr-1 h-4 w-4" /> New template
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card className="grid place-items-center p-12 text-muted-foreground">
          No templates match these filters.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Template</th>
                <th className="p-3">Status</th>
                <th className="p-3">Featured</th>
                <th className="p-3">Pinned</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t: any) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="p-3">
                    <Link
                      to="/templates/$slug"
                      params={{ slug: t.slug }}
                      className="font-medium hover:text-primary"
                    >
                      {t.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      /{t.slug} · {t.uses_count} uses · ⭐ {Number(t.rating_avg).toFixed(1)}
                    </div>
                  </td>
                  <td className="p-3">
                    <Select
                      value={t.status}
                      onValueChange={(v) => update.mutate({ id: t.id, patch: { status: v } })}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Switch
                      checked={!!t.is_featured}
                      onCheckedChange={(v) =>
                        update.mutate({ id: t.id, patch: { is_featured: !!v } })
                      }
                    />
                  </td>
                  <td className="p-3">
                    <Switch
                      checked={!!t.is_pinned}
                      onCheckedChange={(v) =>
                        update.mutate({ id: t.id, patch: { is_pinned: !!v } })
                      }
                    />
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/templates/$slug" params={{ slug: t.slug }}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {t.status !== "published" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update.mutate({ id: t.id, patch: { status: "published" } })}
                      >
                        <ShieldCheck className="mr-1 h-4 w-4" /> Approve
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update.mutate({ id: t.id, patch: { status: "rejected" } })}
                      >
                        <ShieldX className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Card className="p-4 text-xs text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
          <Star className="h-3.5 w-3.5 text-amber-400" /> Featured
        </div>
        Templates marked as featured appear at the top of the marketplace and on the homepage.{" "}
        <Pin className="ml-2 inline h-3 w-3" /> Pinned templates stick to the top of their category.
      </Card>
    </div>
  );
}
