import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listUsersAdmin,
  setUserRole,
  banUser,
  unbanUser,
  deleteUser,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShieldOff, Trash2, ShieldCheck, UserX, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersPage });

type DialogState =
  | { type: "none" }
  | { type: "ban"; user: any }
  | { type: "unban"; user: any }
  | { type: "delete"; user: any };

function UsersPage() {
  const list = useServerFn(listUsersAdmin);
  const setRole = useServerFn(setUserRole);
  const banFn = useServerFn(banUser);
  const unbanFn = useServerFn(unbanUser);
  const deleteFn = useServerFn(deleteUser);

  const [q, setQ] = useState("");
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleBan() {
    if (dialog.type !== "ban") return;
    setLoading(true);
    try {
      await banFn({ data: { userId: dialog.user.id, reason: banReason || undefined } });
      toast.success(`${dialog.user.display_name ?? dialog.user.username ?? "User"} ko ban kar diya gaya`);
      setDialog({ type: "none" });
      setBanReason("");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnban() {
    if (dialog.type !== "unban") return;
    setLoading(true);
    try {
      await unbanFn({ data: { userId: dialog.user.id } });
      toast.success(`${dialog.user.display_name ?? dialog.user.username ?? "User"} ka ban hata diya gaya`);
      setDialog({ type: "none" });
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (dialog.type !== "delete") return;
    setLoading(true);
    try {
      await deleteFn({ data: { userId: dialog.user.id } });
      toast.success(`${dialog.user.display_name ?? dialog.user.username ?? "User"} ko delete kar diya gaya`);
      setDialog({ type: "none" });
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  const userName = (u: any) => u.display_name ?? u.username ?? u.id.slice(0, 8);

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
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Country</th>
                <th className="text-right p-3">Level</th>
                <th className="text-right p-3">XP</th>
                <th className="text-right p-3">Best WPM</th>
                <th className="text-right p-3">Tests</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u: any) => {
                const isBanned = !!u.banned_at;
                return (
                  <tr key={u.id} className={`border-t border-border/40 ${isBanned ? "opacity-60 bg-red-500/5" : ""}`}>
                    <td className="p-3">
                      <div className="font-medium">{userName(u)}</div>
                      <div className="text-xs text-muted-foreground">@{u.username ?? "—"}</div>
                    </td>
                    <td className="p-3">
                      {isBanned ? (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <UserX className="h-3 w-3" />
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-500/40">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">{u.country ?? "—"}</td>
                    <td className="p-3 text-right">{u.level}</td>
                    <td className="p-3 text-right">{u.xp}</td>
                    <td className="p-3 text-right">{u.best_wpm}</td>
                    <td className="p-3 text-right">{u.tests_completed}</td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Admin role toggle */}
                          <DropdownMenuItem onClick={() => toggleAdmin(u.id, true)}>
                            <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleAdmin(u.id, false)}>
                            <ShieldOff className="h-4 w-4 mr-2 text-muted-foreground" />
                            Revoke Admin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Ban / Unban */}
                          {isBanned ? (
                            <DropdownMenuItem onClick={() => setDialog({ type: "unban", user: u })}>
                              <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setDialog({ type: "ban", user: u })}
                              className="text-orange-600 focus:text-orange-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {/* Delete */}
                          <DropdownMenuItem
                            onClick={() => setDialog({ type: "delete", user: u })}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {!data?.length && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={8}>
                    No users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ban Dialog */}
      <Dialog open={dialog.type === "ban"} onOpenChange={(open) => !open && setDialog({ type: "none" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-orange-500" />
              User ko Ban karo
            </DialogTitle>
            <DialogDescription>
              <strong>{dialog.type === "ban" ? userName(dialog.user) : ""}</strong> ko ban karne se woh platform use nahi kar sakega.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Ban ki wajah (optional)</label>
            <Input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. Spam, cheating, abuse…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ type: "none" })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBan} disabled={loading}>
              {loading ? "Banning…" : "Ban Karo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Dialog */}
      <Dialog open={dialog.type === "unban"} onOpenChange={(open) => !open && setDialog({ type: "none" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              Ban Hatao
            </DialogTitle>
            <DialogDescription>
              <strong>{dialog.type === "unban" ? userName(dialog.user) : ""}</strong> ka ban hata doge? Woh phir se platform use kar sakenge.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ type: "none" })}>
              Cancel
            </Button>
            <Button onClick={handleUnban} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Removing…" : "Ban Hatao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dialog.type === "delete"} onOpenChange={(open) => !open && setDialog({ type: "none" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              User Permanently Delete Karo
            </DialogTitle>
            <DialogDescription>
              Yeh action <strong>undo nahi ho sakta</strong>. <strong>{dialog.type === "delete" ? userName(dialog.user) : ""}</strong> ka poora account, data aur history permanently delete ho jayega.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ type: "none" })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting…" : "Haan, Delete Karo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
