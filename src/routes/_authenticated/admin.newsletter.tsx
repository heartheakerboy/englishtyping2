import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { listNewsletterSubscribers, deleteSubscriber } from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({ component: NL });

function NL() {
  const list = useServerFn(listNewsletterSubscribers);
  const del = useServerFn(deleteSubscriber);
  const { data, refetch } = useQuery({ queryKey: ["admin-nl"], queryFn: () => list() });

  function exportCsv() {
    const csv =
      "email,confirmed,source,created_at\n" +
      (data ?? [])
        .map((s: any) => `${s.email},${s.confirmed},${s.source ?? ""},${s.created_at}`)
        .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
          <p className="text-sm text-muted-foreground">{data?.length ?? 0} subscribers.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!data?.length}>
          Export CSV
        </Button>
      </header>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Subscribed</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s: any) => (
              <tr key={s.id} className="border-t border-border/40">
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.source ?? "—"}</td>
                <td className="p-3">{new Date(s.created_at).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await del({ data: { id: s.id } });
                        refetch();
                        toast.success("Removed");
                      } catch (e: any) {
                        toast.error(e.message);
                      }
                    }}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={4} className="p-4 text-muted-foreground">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
