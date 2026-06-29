import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { updateProgress, beginRace, startRoom, leaveRoom } from "@/lib/race.functions";
import { tickRaceWin } from "@/lib/missions.functions";
import { computeLive } from "@/lib/typing-engine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Eye, Crown, LogOut, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fireConfetti } from "@/components/Confetti";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Member = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_spectator: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  finished_at: string | null;
  finish_rank: number | null;
};
type Room = {
  id: string;
  code: string;
  name: string;
  visibility: string;
  ranked: boolean;
  language: string;
  text: string;
  max_players: number;
  status: string;
  host_id: string;
  starts_at: string | null;
  started_at: string | null;
  finished_at: string | null;
};

interface Props {
  room: Room;
  members: Member[];
  meId: string | null;
}

export function MultiplayerRace({ room, members, meId }: Props) {
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [countdown, setCountdown] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSentRef = useRef(0);
  const finishedSelfRef = useRef(false);

  const me = members.find((m) => m.user_id === meId) ?? null;
  const racers = members.filter((m) => !m.is_spectator);
  const spectators = members.filter((m) => m.is_spectator);
  const isHost = meId === room.host_id;
  const isRacer = !!me && !me.is_spectator;
  const canStart =
    isHost && room.status === "waiting" && (room.ranked ? racers.length >= 2 : racers.length >= 1);

  const updateProg = useServerFn(updateProgress);
  const begin = useServerFn(beginRace);
  const start = useServerFn(startRoom);
  const leave = useServerFn(leaveRoom);
  const winTick = useServerFn(tickRaceWin);

  // Countdown handling.
  useEffect(() => {
    if (room.status !== "countdown" || !room.starts_at) {
      setCountdown(null);
      return;
    }
    const target = new Date(room.starts_at).getTime();
    const id = window.setInterval(() => {
      const remaining = Math.max(0, target - Date.now());
      const secs = Math.ceil(remaining / 1000);
      setCountdown(secs);
      if (secs <= 0) {
        window.clearInterval(id);
        setCountdown(null);
        setStartedAt(Date.now());
        sfx.go();
        setTimeout(() => inputRef.current?.focus(), 0);
        if (isHost) begin({ data: { room_id: room.id } }).catch(() => undefined);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [room.status, room.starts_at, room.id, isHost, begin]);

  useEffect(() => {
    if (countdown != null && countdown > 0 && countdown <= 5) sfx.countdown();
  }, [countdown]);

  // If joining mid-race, sync local start time.
  useEffect(() => {
    if (room.status === "racing" && !startedAt && room.started_at) {
      setStartedAt(new Date(room.started_at).getTime());
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [room.status, room.started_at, startedAt]);

  // Tick for live stats.
  useEffect(() => {
    if (!startedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const live = useMemo(() => computeLive(typed, room.text, elapsed), [typed, room.text, elapsed]);
  const progress = Math.min(100, Math.round((typed.length / Math.max(1, room.text.length)) * 100));

  // Throttled progress push.
  useEffect(() => {
    if (!startedAt || !isRacer || finishedSelfRef.current) return;
    const now = Date.now();
    if (now - lastSentRef.current < 400 && progress < 100) return;
    lastSentRef.current = now;
    updateProg({
      data: {
        room_id: room.id,
        progress,
        wpm: live.wpm,
        accuracy: live.accuracy,
        finished: false,
      },
    }).catch(() => undefined);
  }, [progress, live.wpm, live.accuracy, startedAt, isRacer, updateProg, room.id]);

  // Self-finish.
  useEffect(() => {
    if (finishedSelfRef.current || !isRacer || !startedAt) return;
    if (typed.length >= room.text.length) {
      finishedSelfRef.current = true;
      sfx.finish();
      const correct = typed === room.text;
      updateProg({
        data: {
          room_id: room.id,
          progress: 100,
          wpm: live.wpm,
          accuracy: live.accuracy,
          finished: true,
        },
      })
        .then(() => {
          // Detect win for missions.
          const finishedAlready = racers.filter((r) => r.finished_at).length;
          if (correct && finishedAlready === 0) {
            fireConfetti({ intensity: "high" });
            winTick({}).catch(() => undefined);
          } else {
            fireConfetti({ intensity: "low" });
          }
          toast.success("Race complete!");
        })
        .catch(() => undefined);
    }
  }, [
    typed,
    room.text,
    room.id,
    isRacer,
    startedAt,
    live.wpm,
    live.accuracy,
    racers,
    updateProg,
    winTick,
  ]);

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!startedAt || finishedSelfRef.current) return;
    const v = e.target.value;
    if (v.length > room.text.length) return;
    setTyped(v);
  };

  const handleStart = async () => {
    try {
      await start({ data: { room_id: room.id } });
      sfx.click();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cannot start");
    }
  };

  const handleLeave = async () => {
    try {
      await leave({ data: { room_id: room.id } });
      window.history.back();
    } catch {
      window.history.back();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Track */}
      <Card className="border-border/60 bg-surface/40 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>
            Room <span className="font-mono text-foreground">{room.code}</span> ·{" "}
            {room.ranked ? "Ranked" : "Casual"} · {room.language}
          </span>
          <span>
            {racers.length}/{room.max_players} players · {spectators.length} 👁
          </span>
        </div>
        <div className="space-y-2">
          {racers.length === 0 && (
            <p className="text-sm text-muted-foreground">Waiting for players to join…</p>
          )}
          {racers
            .sort(
              (a, b) =>
                (b.finish_rank ? -1 : 0) - (a.finish_rank ? -1 : 0) || b.progress - a.progress,
            )
            .map((m) => (
              <RacerRow
                key={m.user_id}
                member={m}
                isHost={m.user_id === room.host_id}
                isMe={m.user_id === meId}
              />
            ))}
        </div>
      </Card>

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-background/40 backdrop-blur-sm"
          >
            <div className="font-display text-[12rem] font-bold text-gradient drop-shadow-2xl">
              {countdown}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status / controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-surface/30 p-3 text-sm">
        <div className="flex items-center gap-3">
          <StatusBadge status={room.status} />
          {isRacer && room.status === "racing" && (
            <span className="font-mono text-muted-foreground">
              WPM <span className="text-foreground">{live.wpm}</span> · ACC{" "}
              <span className="text-foreground">{live.accuracy}%</span>
            </span>
          )}
          {!isRacer && me && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" /> Spectator
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {canStart && (
            <Button
              onClick={handleStart}
              className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            >
              <Play className="h-4 w-4" /> Start race
            </Button>
          )}
          {isHost && room.status === "waiting" && !canStart && (
            <Button disabled variant="outline">
              <Loader2 className="h-4 w-4 animate-spin" /> Waiting for racers…
            </Button>
          )}
          <Button variant="outline" onClick={handleLeave}>
            <LogOut className="h-4 w-4" /> Leave
          </Button>
        </div>
      </div>

      {/* Text */}
      <Card
        className={cn(
          "cursor-text border-border/60 bg-surface/30 p-6 md:p-8 backdrop-blur transition-all glass",
          startedAt && !finishedSelfRef.current && "border-primary/40 shadow-glow",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="font-mono text-2xl leading-loose tracking-wider md:text-3xl">
          {room.text.split("").map((ch, i) => {
            const t = typed[i];
            const isCaret = i === typed.length && !!startedAt;
            let cls = "text-typing-untyped";
            if (t !== undefined)
              cls =
                t === ch
                  ? "text-typing-correct"
                  : "text-typing-incorrect underline decoration-typing-incorrect/60";
            return (
              <span key={i} className={cn("relative", cls)}>
                {isCaret && (
                  <span
                    className="pointer-events-none absolute -left-px top-0 h-[1.4em] w-0.5 bg-typing-caret animate-caret"
                    aria-hidden
                  />
                )}
                {ch}
              </span>
            );
          })}
        </div>
      </Card>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleType}
        disabled={!startedAt || finishedSelfRef.current || !isRacer}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Race input"
        className="sr-only"
      />

      {spectators.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" /> Spectators:
          {spectators.map((s) => (
            <span key={s.user_id} className="rounded-full bg-surface px-2 py-0.5">
              {s.display_name || "Guest"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RacerRow({ member, isHost, isMe }: { member: Member; isHost: boolean; isMe: boolean }) {
  const finished = !!member.finished_at;
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0 truncate text-sm">
        {isHost && <Crown className="mr-1 inline h-3.5 w-3.5 text-primary" />}
        <span className={cn(isMe && "font-semibold text-primary")}>
          {member.display_name || "Player"}
        </span>
      </div>
      <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-border/40">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-gradient-primary",
            finished && "bg-success/80",
          )}
          animate={{ width: `${member.progress}%` }}
          transition={{ ease: "linear", duration: 0.2 }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-mono tabular-nums">
          <span className="text-foreground/80">{Math.round(Number(member.wpm))} wpm</span>
          <span className="text-foreground/60">{Math.round(Number(member.accuracy))}%</span>
        </div>
      </div>
      <div className="w-12 shrink-0 text-right text-sm font-mono tabular-nums">
        {finished ? (
          <span className="inline-flex items-center gap-1 text-success">
            <Trophy className="h-3.5 w-3.5" /> #{member.finish_rank}
          </span>
        ) : (
          <span className="text-muted-foreground">{member.progress}%</span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    waiting: { label: "Waiting", cls: "bg-muted text-muted-foreground" },
    countdown: { label: "Countdown", cls: "bg-warning/20 text-warning" },
    racing: { label: "Racing", cls: "bg-primary/20 text-primary" },
    finished: { label: "Finished", cls: "bg-success/20 text-success" },
  };
  const s = map[status] ?? map.waiting;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs uppercase tracking-wider", s.cls)}>
      {s.label}
    </span>
  );
}
