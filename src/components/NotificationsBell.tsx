import { useEffect, useState } from "react";
import { Bell, Check, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listNotifications, markAllRead } from "@/lib/notifications.functions";
import { formatDistanceToNow } from "date-fns";
import { sfx } from "@/lib/sound";

export function NotificationsBell({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: items } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications(),
  });
  const markFn = useServerFn(markAllRead);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(`notif:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          sfx.notify();
          qc.invalidateQueries({ queryKey: ["notifications"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  const unread = (items ?? []).filter((n) => !n.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notifications"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border/60 p-3">
          <span className="text-sm font-medium">Notifications</span>
          {unread > 0 && (
            <button
              onClick={async () => {
                await markFn({});
                qc.invalidateQueries({ queryKey: ["notifications"] });
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {(items ?? []).length === 0 && (
            <div className="grid place-items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <Inbox className="h-6 w-6" /> No notifications yet
            </div>
          )}
          {(items ?? []).map((n) => (
            <div
              key={n.id}
              className={`border-b border-border/40 p-3 text-sm last:border-b-0 ${!n.read ? "bg-primary/5" : ""}`}
            >
              <div className="font-medium">{n.title}</div>
              {n.body && <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>}
              <div className="mt-1 text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
