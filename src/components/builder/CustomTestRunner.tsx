// Custom test runner: drives a typing test from a custom_tests record.
// Standalone (does not depend on TestConfigBar / store), supports
// duration-based or content-based completion, with anti-cheat hooks.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  computeCharStats,
  computeConsistency,
  computeLive,
  countMistakes,
  buildMistakeMap,
  type WpmSample,
} from "@/lib/typing-engine";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomRunResult {
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  consistency: number;
  mistakes: number;
  duration_actual: number;
  flag_reasons: string[];
  samples: WpmSample[];
  mistakeMap: Record<string, number>;
  target: string;
  typed: string;
}

interface Props {
  test: any;
  onFinish: (r: CustomRunResult) => void;
}

export function CustomTestRunner({ test, onFinish }: Props) {
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [finished, setFinished] = useState(false);
  const samplesRef = useRef<WpmSample[]>([]);
  const lastSampleSec = useRef(0);
  const flagsRef = useRef<Set<string>>(new Set());
  const keystrokeGaps = useRef<number[]>([]);
  const lastKeyAt = useRef<number>(0);
  const backspacesUsed = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const target = test.content || "";
  const duration = test.duration_seconds || 60;
  const ac = test.anticheat_flags || {};
  const limitedBackspace = test.backspace_mode === "limited";
  const noBackspace = test.backspace_mode === "not_allowed";

  // anti-cheat hooks
  useEffect(() => {
    if (typeof navigator !== "undefined" && (navigator as any).webdriver && ac.bots) {
      flagsRef.current.add("bot_detected");
    }
    const onVis = () => {
      if (document.hidden && startedAt && !finished && ac.tab_switch)
        flagsRef.current.add("tab_switch");
    };
    const onPaste = (e: ClipboardEvent) => {
      if (ac.copy_paste) {
        e.preventDefault();
        flagsRef.current.add("paste_blocked");
      }
    };
    const onCopy = (e: ClipboardEvent) => {
      if (ac.copy_paste) e.preventDefault();
    };
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("paste", onPaste);
    document.addEventListener("copy", onCopy);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("copy", onCopy);
    };
  }, [startedAt, finished, ac]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (!startedAt || finished) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [startedAt, finished]);

  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const live = useMemo(() => computeLive(typed, target, elapsed), [typed, target, elapsed]);
  const mistakes = useMemo(() => countMistakes(typed, target), [typed, target]);

  useEffect(() => {
    if (!startedAt || finished) return;
    const sec = Math.floor(elapsed);
    if (sec > lastSampleSec.current && sec > 0) {
      samplesRef.current.push({ t: sec, wpm: live.wpm, rawWpm: live.rawWpm, errors: mistakes });
      lastSampleSec.current = sec;
    }
  }, [elapsed, live.wpm, live.rawWpm, mistakes, startedAt, finished]);

  const finish = useCallback(
    (finalTyped: string, finalSeconds: number) => {
      if (finished) return;
      setFinished(true);
      const finalLive = computeLive(finalTyped, target, finalSeconds);
      const consistency = computeConsistency(samplesRef.current.map((s) => s.wpm));
      const chars = computeCharStats(finalTyped, target.slice(0, finalTyped.length));

      // suspicious-speed / macro detection
      if (ac.suspicious_speed && finalLive.wpm > 220) flagsRef.current.add("suspicious_speed");
      if (ac.macros && keystrokeGaps.current.length > 25) {
        const gaps = keystrokeGaps.current;
        const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const variance = gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length;
        if (variance < 50 && mean < 90) flagsRef.current.add("macro_pattern");
      }

      onFinish({
        wpm: finalLive.wpm,
        raw_wpm: finalLive.rawWpm,
        accuracy: finalLive.accuracy,
        consistency: Math.round(consistency),
        mistakes: chars.incorrect,
        duration_actual: Math.round(finalSeconds),
        flag_reasons: Array.from(flagsRef.current),
        samples: samplesRef.current.slice(),
        mistakeMap: buildMistakeMap(finalTyped, target),
        target,
        typed: finalTyped,
      });
    },
    [finished, target, onFinish, ac],
  );

  // auto-finish on duration
  useEffect(() => {
    if (!startedAt || finished) return;
    if (elapsed >= duration) finish(typed, duration);
  }, [elapsed, duration, finish, finished, startedAt, typed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    const v = e.target.value;
    // backspace policing
    if (v.length < typed.length) {
      if (noBackspace) return;
      if (limitedBackspace) {
        backspacesUsed.current += typed.length - v.length;
        if (backspacesUsed.current > (test.backspace_limit || 0)) return;
      }
    }
    const t = Date.now();
    if (lastKeyAt.current) keystrokeGaps.current.push(t - lastKeyAt.current);
    lastKeyAt.current = t;

    if (!startedAt && v.length > 0) setStartedAt(t);
    setTyped(v);
    if (v.length >= target.length) {
      const start = startedAt ?? t;
      finish(v, (t - start) / 1000);
    }
  };

  const reset = () => {
    setTyped("");
    setStartedAt(null);
    setFinished(false);
    samplesRef.current = [];
    lastSampleSec.current = 0;
    flagsRef.current = new Set();
    keystrokeGaps.current = [];
    backspacesUsed.current = 0;
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const progress = Math.min(100, (elapsed / duration) * 100);
  const remaining = Math.max(0, Math.ceil(duration - elapsed));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-wrap items-center gap-5">
          <Stat highlight label="time" value={`${remaining}s`} />
          <Stat label="wpm" value={live.wpm} />
          <Stat label="acc" value={`${live.accuracy}%`} />
          <Stat label="cpm" value={live.cpm} />
          <Stat label="errors" value={mistakes} tone={mistakes > 0 ? "destructive" : undefined} />
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> restart
        </button>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full bg-gradient-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>

      <div
        className="rounded-xl border border-border/60 bg-surface/30 p-6 md:p-8 text-2xl md:text-3xl leading-loose tracking-wider font-mono glass"
        onClick={() => inputRef.current?.focus()}
        spellCheck={!!test.spell_check}
      >
        {target.split("").map((ch: string, i: number) => {
          const t = typed[i];
          let cls = "text-muted-foreground/60";
          if (t != null)
            cls =
              t === ch ? "text-foreground" : "text-destructive underline decoration-destructive";
          return (
            <span
              key={i}
              className={cn(cls, i === typed.length && "border-l-2 border-primary -ml-px")}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        autoFocus
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={!!test.spell_check}
        className="sr-only"
        aria-label="Typing input"
      />

      {finished && (
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: any;
  highlight?: boolean;
  tone?: "destructive";
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        className={cn(
          "text-xl font-semibold tabular-nums",
          highlight && "text-primary",
          tone === "destructive" && "text-destructive",
        )}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
