import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAuditLogs,
  listActivityLogs,
  listLoginHistory,
} from "@/lib/admin-enterprise.functions";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/audit")({ component: AuditPage });

function AuditPage() {
  const [tab, setTab] = useState<"audit" | "activity" | "logins">("audit");
  const audit = useServerFn(listAuditLogs);
  const activity = useServerFn(listActivityLogs);
  const logins = useServerFn(listLoginHistory);
  const { data: auditRows } = useQuery({
    queryKey: ["audit"],
    queryFn: () => audit(),
    enabled: tab === "audit",
  });
  const { data: actRows } = useQuery({
    queryKey: ["activity"],
    queryFn: () => activity(),
    enabled: tab === "activity",
  });
  const { data: loginRows } = useQuery({
    queryKey: ["logins"],
    queryFn: () => logins(),
    enabled: tab === "logins",
  });

  const tabs: Array<{ id: typeof tab; label: string }> = [
    { id: "audit", label: "Audit (admin actions)" },
    { id: "activity", label: "Activity (in-app)" },
    { id: "logins", label: "Login history" },
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Audit & Logs</h1>
        <p className="text-sm text-muted-foreground">
          Full traceability of admin actions, user activity and sign-ins.
        </p>
      </header>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm ${tab === t.id ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "audit" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Entity</th>
                  <th className="text-left p-3">After</th>
                </tr>
              </thead>
              <tbody>
                {(auditRows ?? []).map((r: any) => (
                  <tr key={r.id} className="border-t border-border/40">
                    <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-xs">{r.user_id?.slice(0, 8) ?? "—"}</td>
                    <td className="p-3">{r.action}</td>
                    <td className="p-3">
                      {r.entity_type}
                      {r.entity_id ? ` · ${r.entity_id.slice(0, 8)}` : ""}
                    </td>
                    <td className="p-3">
                      <pre className="max-w-md truncate text-xs text-muted-foreground">
                        {r.after ? JSON.stringify(r.after) : ""}
                      </pre>
                    </td>
                  </tr>
                ))}
                {!auditRows?.length && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No audit events yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "activity" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Path</th>
                </tr>
              </thead>
              <tbody>
                {(actRows ?? []).map((r: any) => (
                  <tr key={r.id} className="border-t border-border/40">
                    <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-xs">{r.user_id?.slice(0, 8) ?? "—"}</td>
                    <td className="p-3">{r.action}</td>
                    <td className="p-3 truncate max-w-sm">{r.path}</td>
                  </tr>
                ))}
                {!actRows?.length && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      No activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "logins" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Success</th>
                  <th className="text-left p-3">IP</th>
                  <th className="text-left p-3">Agent</th>
                </tr>
              </thead>
              <tbody>
                {(loginRows ?? []).map((r: any) => (
                  <tr key={r.id} className="border-t border-border/40">
                    <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-xs">{r.user_id?.slice(0, 8) ?? "—"}</td>
                    <td className="p-3">{r.success ? "✅" : "❌"}</td>
                    <td className="p-3">{r.ip ?? "—"}</td>
                    <td className="p-3 truncate max-w-md text-xs text-muted-foreground">
                      {r.user_agent}
                    </td>
                  </tr>
                ))}
                {!loginRows?.length && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No sign-ins recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
