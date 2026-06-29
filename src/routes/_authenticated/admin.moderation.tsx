import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listUsersAdmin } from "@/lib/admin.functions";
import {
  banUser,
  unbanUser,
  suspendUser,
  resetUserProgress,
  addAdminNote,
} from "@/lib/admin-enterprise.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/moderation")({
  component: ModerationPage,
});

function ModerationPage() {
  const search = useServerFn(listUsersAdmin);
  const ban = useServerFn(banUser);
  const unban = useServerFn(unbanUser);
  const suspend = useServerFn(suspendUser);
  const reset = useServerFn(resetUserProgress);
  const note = useServerFn(addAdminNote);

  const [q, setQ] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function find() {
    setBusy(true);
    try {
      setRows(await search({ data: { search: q, limit: 25 } }));
    } catch (e: any) {
      toast.error(e.message);
    }
    setBusy(false);
  }

  async function onBan(id: string) {
    const reason = prompt("Ban reason?");
    if (reason === null) return;
    try {
      await ban({ data: { userId: id, reason } });
      toast.success("Banned");
      find();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onUnban(id: string) {
    try {
      await unban({ data: { userId: id } });
      toast.success("Unbanned");
      find();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onSuspend(id: string) {
    const days = prompt("Suspend for how many days?", "7");
    const n = Number(days);
    if (!n || n < 1) return;
    const until = new Date(Date.now() + n * 86400000).toISOString();
    try {
      await suspend({ data: { userId: id, until } });
      toast.success("Suspended");
      find();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onReset(id: string) {
    if (!confirm("Wipe all typing results & reset XP/level/best for this user?")) return;
    try {
      await reset({ data: { userId: id } });
      toast.success("Reset");
      find();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Moderation</h1>
        <p className="text-sm text-muted-foreground">Search a user and apply moderation actions.</p>
      </header>

      <Card className="p-3 flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search username or display name"
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && find()}
        />
        <Button onClick={find} disabled={busy}>
          {busy ? "Searching…" : "Search"}
        </Button>
      </Card>

      <div className="space-y-2">
        {rows.map((u) => (
          <Card key={u.id} className="p-3">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{u.display_name ?? u.username ?? "user"}</span>
                  <code className="text-xs text-muted-foreground">{u.id.slice(0, 8)}</code>
                </div>
                <div className="text-xs text-muted-foreground">
                  XP {u.xp} · L{u.level} · Best {u.best_wpm} WPM · {u.tests_completed} tests ·{" "}
                  {u.country ?? "—"}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" onClick={() => onSuspend(u.id)}>
                  Suspend
                </Button>
                <Button size="sm" variant="outline" onClick={() => onBan(u.id)}>
                  Ban
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onUnban(u.id)}>
                  Unban
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onReset(u.id)}>
                  Reset progress
                </Button>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground">
                Admin notes
              </summary>
              <NoteEditor
                userId={u.id}
                onSave={async (text) => {
                  try {
                    await note({ data: { userId: u.id, note: text } });
                    toast.success("Saved");
                  } catch (e: any) {
                    toast.error(e.message);
                  }
                }}
              />
            </details>
          </Card>
        ))}
        {!rows.length && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Search above to load users.
          </div>
        )}
      </div>
    </div>
  );
}

function NoteEditor({ userId, onSave }: { userId: string; onSave: (text: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="mt-2 space-y-2">
      <Textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={`Note for ${userId.slice(0, 8)}…`}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => onSave(v)}>
          Save note
        </Button>
      </div>
    </div>
  );
}
