// Reusable arcade game shell: HUD, pause/resume/restart/fullscreen, sound toggle.
// Renders the playfield via children. Keeps the design system consistent
// across every game in the Typing Games Center.
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Pause,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Trophy,
} from "lucide-react";

export type GameStatus = "idle" | "playing" | "paused" | "over";

export interface ShellProps {
  title: string;
  status: GameStatus;
  score: number;
  combo?: number;
  lives?: number;
  level?: number;
  timeLeft?: number | null;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onShowLeaderboard?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  shortcuts?: ReactNode;
}

export function GameShell(props: ShellProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goFullscreen = async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    function handleFullscreenChange() {
      const active = !!(document.fullscreenElement && document.fullscreenElement === wrapRef.current);
      setIsFullscreen(active);
      if (active) {
        const w = 1024;
        const h = 640;
        const scaleX = window.innerWidth / w;
        const scaleY = window.innerHeight / h;
        // Scale to fit, but don't blow up beyond reasonable pixel grid spacing if very small
        const newScale = Math.min(scaleX, scaleY);
        setScale(newScale);
      } else {
        setScale(1);
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("resize", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("resize", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && props.status === "playing") props.onPause();
      if (e.key === " " && (props.status === "paused" || props.status === "over")) {
        e.preventDefault();
        if (props.status === "paused") props.onResume();
        else props.onRestart();
      }
      if (e.key.toLowerCase() === "r" && (e.ctrlKey || e.metaKey)) return; // let browser reload
      if (e.key === "F2") {
        e.preventDefault();
        props.onToggleMute();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props]);

  return (
    <div
      ref={wrapRef}
      className={`relative mx-auto w-full max-w-5xl ${
        isFullscreen
          ? "flex h-screen w-screen items-center justify-center overflow-hidden bg-[#0b0f19] p-4"
          : ""
      }`}
    >
      <div
        className="w-full flex flex-col"
        style={
          isFullscreen
            ? {
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                width: "1024px",
                flexShrink: 0,
              }
            : undefined
        }
      >
        {/* HUD */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-surface/70 px-3 py-2 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-display text-base font-semibold">{props.title}</span>
            <Stat label="Score" value={props.score.toLocaleString()} accent />
            {typeof props.combo === "number" && props.combo > 0 && (
              <Stat label="Combo" value={`x${props.combo}`} />
            )}
            {typeof props.lives === "number" && (
              <Stat label="Lives" value={"❤".repeat(Math.max(0, props.lives))} />
            )}
            {typeof props.level === "number" && <Stat label="Wave" value={props.level} />}
            {props.timeLeft != null && (
              <Stat label="Time" value={`${Math.max(0, Math.ceil(props.timeLeft))}s`} />
            )}
          </div>
          <div className="flex items-center gap-1">
            {props.status === "playing" ? (
              <Button size="sm" variant="ghost" onClick={props.onPause} title="Pause (Esc)">
                <Pause className="h-4 w-4" />
              </Button>
            ) : props.status === "paused" ? (
              <Button size="sm" variant="ghost" onClick={props.onResume} title="Resume (Space)">
                <Play className="h-4 w-4" />
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={props.onRestart} title="Restart">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={props.onToggleMute} title="Mute (F2)">
              {props.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={goFullscreen} title="Fullscreen">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {props.onShowLeaderboard && (
              <Button size="sm" variant="ghost" onClick={props.onShowLeaderboard} title="Leaderboard">
                <Trophy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Playfield */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface/80 to-background shadow-glow">
          {props.children}

          {props.status === "paused" && <Overlay title="Paused" subtitle="Press Space to resume" />}
        </div>

        {props.shortcuts && (
          <div className="mt-2 text-center text-[11px] text-muted-foreground">{props.shortcuts}</div>
        )}
        {props.footer && <div className="mt-4">{props.footer}</div>}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${accent ? "font-semibold text-primary" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

export function Overlay({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-background/80 backdrop-blur-sm">
      <div className="rounded-xl border border-border bg-surface/90 px-6 py-5 text-center shadow-glow">
        <div className="font-display text-2xl font-semibold">{title}</div>
        {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
