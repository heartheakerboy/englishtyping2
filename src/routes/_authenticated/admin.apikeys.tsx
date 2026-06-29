import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listApiKeys, createApiKey, revokeApiKey } from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/apikeys")({ component: ApiKeysPage });

function ApiKeysPage() {
  const list = useServerFn(listApiKeys);
  const create = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);
  const { data, refetch } = useQuery({ queryKey: ["admin-apikeys"], queryFn: () => list() });
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState("read");
  const [justCreated, setJustCreated] = useState<string | null>(null);

  async function onCreate() {
    if (!name.trim()) return;
    try {
      const r = await create({
        data: {
          name,
          scopes: scopes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
      setJustCreated(r.token);
      setName("");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onRevoke(id: string) {
    if (!confirm("Revoke this key?")) return;
    try {
      await revoke({ data: { id } });
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          Programmatic access tokens. Only the prefix is stored — keep the full token safe.
        </p>
      </header>

      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-muted-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CI deploy bot"
            />
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-muted-foreground">Scopes (comma)</label>
            <Input
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              placeholder="read,write"
            />
          </div>
          <Button onClick={onCreate}>Create key</Button>
        </div>
        {justCreated && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <div className="mb-1 font-medium text-amber-300">
              Copy this token now — it won't be shown again.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-background px-2 py-1 text-xs">
                {justCreated}
              </code>
              <button
                className="rounded p-1 hover:bg-surface-elevated"
                onClick={() => {
                  navigator.clipboard.writeText(justCreated);
                  toast.success("Copied");
                }}
                aria-label="Copy"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Prefix</th>
              <th className="text-left p-3">Scopes</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Last used</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((k: any) => (
              <tr key={k.id} className="border-t border-border/40">
                <td className="p-3 font-medium">{k.name}</td>
                <td className="p-3">
                  <code className="text-xs">{k.key_prefix}…</code>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {(k.scopes ?? []).join(", ") || "—"}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(k.created_at).toLocaleString()}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "—"}
                </td>
                <td className="p-3 text-xs">
                  {k.revoked_at ? (
                    <span className="text-destructive">revoked</span>
                  ) : (
                    <span className="text-emerald-400">active</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  {!k.revoked_at && (
                    <Button size="sm" variant="ghost" onClick={() => onRevoke(k.id)}>
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
