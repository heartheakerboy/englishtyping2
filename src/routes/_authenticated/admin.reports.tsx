import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { listReportsAdmin, updateReportStatus } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/reports")({ component: ReportsPage });

function ReportsPage() {
  const list = useServerFn(listReportsAdmin);
  const update = useServerFn(updateReportStatus);
  const { data, refetch } = useQuery({ queryKey: ["admin-reports"], queryFn: () => list() });

  async function setStatus(id: string, status: "resolved" | "dismissed") {
    try {
      await update({ data: { id, status } });
      toast.success("Updated");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      </header>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">Target</th>
              <th className="text-left p-3">Reason</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3">
                  {r.target_type}/{r.target_id.slice(0, 8)}
                </td>
                <td className="p-3">{r.reason}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "resolved")}>
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2"
                    onClick={() => setStatus(r.id, "dismissed")}
                  >
                    Dismiss
                  </Button>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={5} className="p-4 text-muted-foreground">
                  No reports.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
