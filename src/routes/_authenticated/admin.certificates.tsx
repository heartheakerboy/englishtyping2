import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listCertificatesAdmin } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  component: CertsPage,
});

function CertsPage() {
  const list = useServerFn(listCertificatesAdmin);
  const { data } = useQuery({ queryKey: ["admin-certs"], queryFn: () => list() });
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Certificates</h1>
      </header>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">User</th>
              <th className="text-right p-3">WPM</th>
              <th className="text-right p-3">Accuracy</th>
              <th className="text-right p-3">View</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="p-3">{new Date(c.issued_at).toLocaleString()}</td>
                <td className="p-3 font-mono text-xs">{c.id.slice(0, 8)}</td>
                <td className="p-3 font-mono text-xs">{c.user_id?.slice(0, 8)}</td>
                <td className="p-3 text-right">{c.wpm}</td>
                <td className="p-3 text-right">{c.accuracy}%</td>
                <td className="p-3 text-right">
                  <Link
                    to="/certificate/$id"
                    params={{ id: c.id }}
                    className="text-primary hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={6} className="p-4 text-muted-foreground">
                  No certificates issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
