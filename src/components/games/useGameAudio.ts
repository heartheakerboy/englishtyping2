// Lightweight WebAudio SFX (no external assets needed).
// Persists mute state in localStorage.
import { useCallback, useEffect, useRef, useState } from "react";

type Sfx = "hit" | "miss" | "pop" | "boss" | "win" | "lose" | "level";

export function useGameAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ett-games-muted") === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ett-games-muted", muted ? "1" : "0");
  }, [muted]);

  const ensureCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        ctxRef.current = new AC();
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (sfx: Sfx) => {
      if (muted) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const make = (freq: number, dur: number, type: OscillatorType = "sine", gain = 0.08) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(gain, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        osc.connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      };

      switch (sfx) {
        case "hit":
          make(660, 0.08, "triangle", 0.06);
          break;
        case "miss":
          make(160, 0.12, "sawtooth", 0.06);
          break;
        case "pop":
          make(880, 0.1, "square", 0.05);
          break;
        case "boss":
          make(110, 0.3, "sawtooth", 0.08);
          make(140, 0.3, "square", 0.05);
          break;
        case "win":
          make(660, 0.1);
          setTimeout(() => make(880, 0.1), 90);
          setTimeout(() => make(1100, 0.18), 200);
          break;
        case "lose":
          make(220, 0.2, "sawtooth");
          setTimeout(() => make(140, 0.3, "sawtooth"), 180);
          break;
        case "level":
          make(740, 0.1);
          setTimeout(() => make(990, 0.14), 100);
          break;
      }
    },
    [ensureCtx, muted],
  );

  return { play, muted, setMuted };
}
