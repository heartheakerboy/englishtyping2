import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { getRoomByCode, joinRoom } from "@/lib/race.functions";
import { Header } from "@/components/Header";
import { MultiplayerRace } from "@/components/MultiplayerRace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Eye, Loader2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/race/$code")({
  loader: async ({ params }) => getRoomByCode({ data: { code: params.code } }),
  head: ({ params }) => ({
    meta: [
      { title: `Race ${params.code.toUpperCase()} — englishtypingtest.org` },
      { name: "description", content: "Live typing race." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RoomPage,
  errorComponent: ({ error }) => <RoomError msg={error.message} />,
  notFoundComponent: () => <RoomError msg="Room not found" />,
});

function RoomError({ msg }: { msg: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl">{msg}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The room may have ended or never existed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/race">Back to lobby</Link>
        </Button>
      </main>
    </div>
  );
}

function RoomPage() {
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const [meId, setMeId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const joinFn = useServerFn(joinRoom);

  const [room, setRoom] = useState(data?.room);
  const [members, setMembers] = useState<any[]>(data?.members ?? []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!room?.id) return;
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${room.id}` },
        (payload) => {
          setMembers((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as { user_id: string };
              return prev.filter((m) => m.user_id !== old.user_id);
            }
            const row = payload.new as any;
            const idx = prev.findIndex((m) => m.user_id === row.user_id);
            if (idx === -1) return [...prev, row];
            const next = prev.slice();
            next[idx] = { ...next[idx], ...row };
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        (payload) => setRoom((r: any) => ({ ...r, ...(payload.new as any) })),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  const isMember =
    !!meId && (members.some((m: { user_id: string }) => m.user_id === meId) ?? false);
  useEffect(() => {
    if (isMember) setJoined(true);
  }, [isMember]);

  const joinMutation = useMutation({
    mutationFn: (spectator: boolean) => joinFn({ data: { code: data!.room.code, spectator } }),
    onSuccess: () => setJoined(true),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not join"),
  });

  if (!data) return <RoomError msg="Room not found" />;

  const copyInvite = async () => {
    const url = `${window.location.origin}/race/${room.code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-semibold">{room.name}</h1>
            <p className="text-sm text-muted-foreground">
              Share code <span className="font-mono text-foreground">{room.code}</span> to invite
              friends.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyInvite}>
              <Copy className="h-4 w-4" /> Copy invite
            </Button>
            {!meId && (
              <Button onClick={() => navigate({ to: "/auth" })}>
                <LogIn className="h-4 w-4" /> Sign in to join
              </Button>
            )}
          </div>
        </div>

        {meId && !joined ? (
          <Card className="border-border/60 bg-surface/40 p-8 text-center backdrop-blur">
            <h2 className="font-display text-xl">Join this race</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {members.filter((m: { is_spectator: boolean }) => !m.is_spectator).length}/
              {room.max_players} players · status: {room.status}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button
                onClick={() => joinMutation.mutate(false)}
                disabled={joinMutation.isPending || room.status === "finished"}
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Join
                as racer
              </Button>
              <Button
                variant="outline"
                onClick={() => joinMutation.mutate(true)}
                disabled={joinMutation.isPending}
              >
                <Eye className="h-4 w-4" /> Spectate
              </Button>
            </div>
          </Card>
        ) : (
          <MultiplayerRace room={room} members={members} meId={meId} />
        )}
      </main>
    </div>
  );
}
