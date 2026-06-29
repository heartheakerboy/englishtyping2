import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listUsersAdmin, setUserRole } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersPage });

function UsersPage() {
  const list = useServerFn(listUsersAdmin);
  const setRole = useServerFn(setUserRole);
  const [q, setQ] = useState("");
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: () => list({ data: { search: q, limit: 100 } }),
  });

  async function toggleAdmin(userId: string, grant: boolean) {
    try {
      await setRole({ data: { userId, role: "admin", grant } });
      toast.success(grant ? "Admin granted" : "Admin revoked");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username…"
            className="w-64"
          />
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            Search
          </Button>
        </div>
      </header>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Country</th>
                <th className="text-right p-3">Level</th>
                <th className="text-right p-3">XP</th>
                <th className="text-right p-3">Best WPM</th>
                <th className="text-right p-3">Tests</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u: any) => (
                <tr key={u.id} className="border-t border-border/40">
                  <td className="p-3">
                    <div className="font-medium">
                      {u.display_name ?? u.username ?? u.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-muted-foreground">@{u.username ?? "—"}</div>
                  </td>
                  <td className="p-3">{u.country ?? "—"}</td>
                  <td className="p-3 text-right">{u.level}</td>
                  <td className="p-3 text-right">{u.xp}</td>
                  <td className="p-3 text-right">{u.best_wpm}</td>
                  <td className="p-3 text-right">{u.tests_completed}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.id, true)}>
                        Make admin
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleAdmin(u.id, false)}>
                        Revoke
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={7}>
                    No users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
