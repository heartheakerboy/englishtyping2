import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateWordsForLanguage, isRTL } from "@/lib/languages";
import {
  computeCharStats,
  computeConsistency,
  computeLive,
  countMistakes,
  buildMistakeMap,
  type CharStats,
  type LiveStats,
  type WpmSample,
} from "@/lib/typing-engine";
import { useTestConfig, type TestMode } from "@/lib/test-store";
import { pickQuote, STORIES, BOOKS, CODE_SNIPPETS, pickRandom } from "@/lib/corpus";
import { buildCategoryText } from "@/lib/categories";
import { TestConfigBar } from "@/components/TestConfigBar";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FinishedRun {
  mode: TestMode;
  modeValue: number;
  durationSeconds: number;
  live: LiveStats;
  chars: CharStats;
  consistency: number;
  samples: WpmSample[];
  mistakeMap: Record<string, number>;
  target: string;
  typed: string;
  language: string;
}

interface Props {
  onFinish: (run: FinishedRun) => void;
}

function buildTarget(cfg: ReturnType<typeof useTestConfig.getState>): string {
  const lang = cfg.language;
  const wordGen = (n: number) => generateWordsForLanguage(n, lang);
  // Custom/AI modes always use the user-supplied text and must bypass category overrides.
  if (cfg.mode === "custom" && cfg.customText.trim()) return cfg.customText;
  if (cfg.mode === "ai" && cfg.aiText.trim()) return cfg.aiText;
  const catOverride =
    cfg.category !== "general" &&
    cfg.category !== "quotes" &&
    cfg.category !== "books" &&
    cfg.category !== "stories" &&
    cfg.category !== "coding" &&
    cfg.category !== "lessons";
  if (catOverride) {
    return buildCategoryText(cfg.category, cfg.wordCount, () => wordGen(cfg.wordCount));
  }

  switch (cfg.mode) {
    case "time": {
      const words = Math.max(60, Math.ceil((cfg.timeSeconds / 60) * 200));
      return wordGen(words);
    }
    case "words":
      return wordGen(cfg.wordCount);
    case "quote":
      return lang === "english" ? pickQuote(cfg.quoteLength).text : wordGen(20);
    case "paragraph":
      return lang === "english"
        ? Math.random() < 0.5
          ? pickRandom(STORIES)
          : pickRandom(BOOKS)
        : wordGen(40);
    case "code":
      return pickRandom(CODE_SNIPPETS).code;
    case "custom":
      return cfg.customText.trim() || wordGen(40);
    case "ai":
      return cfg.aiText.trim() || wordGen(40);
  }
}

export function TypingTest({ onFinish }: Props) {
  const cfg = useTestConfig();
  const [target, setTarget] = useState<string>("");
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [finished, setFinished] = useState(false);
  const samplesRef = useRef<WpmSample[]>([]);
  const lastSampleSec = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const rtl = isRTL(cfg.language);

  const reset = useCallback(() => {
    setTarget(buildTarget(useTestConfig.getState()));
    setTyped("");
    setStartedAt(null);
    setNow(Date.now());
    setFinished(false);
    samplesRef.current = [];
    lastSampleSec.current = 0;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Build initial target only on the client to avoid SSR hydration mismatches
  // (Math.random differs between server and client renders).
  useEffect(() => {
    if (!target) setTarget(buildTarget(useTestConfig.getState()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cfg.mode,
    cfg.timeSeconds,
    cfg.wordCount,
    cfg.quoteLength,
    cfg.customText,
    cfg.customSeed,
    cfg.language,
    cfg.category,
    cfg.aiText,
  ]);

  useEffect(() => {
    if (!startedAt || finished) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [startedAt, finished]);

  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const live = useMemo(() => computeLive(typed, target, elapsed), [typed, target, elapsed]);
  const mistakeCount = useMemo(() => countMistakes(typed, target), [typed, target]);

  useEffect(() => {
    if (!startedAt || finished) return;
    const sec = Math.floor(elapsed);
    if (sec > lastSampleSec.current && sec > 0) {
      samplesRef.current.push({ t: sec, wpm: live.wpm, rawWpm: live.rawWpm, errors: mistakeCount });
      lastSampleSec.current = sec;
    }
  }, [elapsed, live.wpm, live.rawWpm, mistakeCount, startedAt, finished]);

  const finish = useCallback(
    (finalTyped: string, finalSeconds: number) => {
      if (finished) return;
      setFinished(true);
      const finalLive = computeLive(finalTyped, target, finalSeconds);
      const chars = computeCharStats(finalTyped, target.slice(0, finalTyped.length));
      const totalChars = computeCharStats(finalTyped, target);
      const consistency = computeConsistency(samplesRef.current.map((s) => s.wpm));
      onFinish({
        mode: cfg.mode,
        modeValue:
          cfg.mode === "time"
            ? cfg.timeSeconds
            : cfg.mode === "words"
              ? cfg.wordCount
              : cfg.mode === "quote"
                ? cfg.quoteLength === "short"
                  ? 1
                  : cfg.quoteLength === "medium"
                    ? 2
                    : 3
                : finalTyped.length,
        durationSeconds: Math.round(finalSeconds * 100) / 100,
        live: finalLive,
        chars: {
          correct: chars.correct,
          incorrect: chars.incorrect,
          extra: chars.extra,
          missed: totalChars.missed,
        },
        consistency,
        samples: samplesRef.current.slice(),
        mistakeMap: buildMistakeMap(finalTyped, target),
        target,
        typed: finalTyped,
        language: cfg.language,
      });
    },
    [finished, cfg, onFinish, target],
  );

  useEffect(() => {
    if (cfg.mode !== "time" || !startedAt || finished) return;
    if (elapsed >= cfg.timeSeconds) finish(typed, cfg.timeSeconds);
  }, [cfg.mode, cfg.timeSeconds, startedAt, finished, elapsed, typed, finish]);

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    const v = e.target.value;
    if (!startedAt && v.length > 0) setStartedAt(Date.now());
    setTyped(v);
    const requiresExact = cfg.mode !== "time";
    if (requiresExact && v.length >= target.length) {
      const start = startedAt ?? Date.now();
      finish(v, (Date.now() - start) / 1000);
    }
  };

  const progress = Math.min(
    100,
    cfg.mode === "time" ? (elapsed / cfg.timeSeconds) * 100 : (typed.length / target.length) * 100,
  );

  const nextChar = target[typed.length];

  return (
    <div className="flex flex-col gap-6">
      <TestConfigBar disabled={!!startedAt && !finished} />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-5">
          <Stat
            highlight
            label={cfg.mode === "time" ? "time" : "progress"}
            value={
              cfg.mode === "time"
                ? `${Math.max(0, Math.ceil(cfg.timeSeconds - elapsed))}s`
                : `${Math.round(progress)}%`
            }
          />
          <Stat label="wpm" value={live.wpm} />
          <Stat label="acc" value={`${live.accuracy}%`} />
          <Stat label="cpm" value={live.cpm} />
          <Stat
            label="errors"
            value={mistakeCount}
            tone={mistakeCount > 0 ? "destructive" : undefined}
          />
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> restart
        </button>
      </div>

      <div className="h-0.5 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full bg-gradient-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>

      <TextDisplay
        target={target}
        typed={typed}
        active={!!startedAt && !finished}
        onFocus={() => inputRef.current?.focus()}
        isCode={cfg.mode === "code"}
        rtl={rtl}
      />

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleType}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
        className="sr-only"
        dir={rtl ? "rtl" : "ltr"}
      />

      <AnimatePresence>
        {cfg.showKeyboard && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <VirtualKeyboard
              layoutId={cfg.layout}
              nextChar={nextChar}
              showFingerGuide={cfg.showFingerGuide}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-muted-foreground">
        Click the text and start typing.{" "}
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
          Tab
        </kbd>
        {" + "}
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
          Enter
        </kbd>{" "}
        to restart.
      </p>

      <RestartShortcut onRestart={reset} />
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
  value: React.ReactNode;
  highlight?: boolean;
  tone?: "destructive";
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className={cn(
          "text-2xl font-semibold tabular-nums font-mono",
          highlight
            ? "text-primary"
            : tone === "destructive"
              ? "text-destructive"
              : "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function TextDisplay({
  target,
  typed,
  active,
  onFocus,
  isCode,
  rtl,
}: {
  target: string;
  typed: string;
  active: boolean;
  onFocus: () => void;
  isCode?: boolean;
  rtl?: boolean;
}) {
  const { currentWordStart, currentWordEnd } = useMemo(() => {
    const i = typed.length;
    let start = i;
    while (start > 0 && target[start - 1] !== " " && target[start - 1] !== "\n") start--;
    let end = i;
    while (end < target.length && target[end] !== " " && target[end] !== "\n") end++;
    return { currentWordStart: start, currentWordEnd: end };
  }, [target, typed.length]);

  const chars = useMemo(() => target.split(""), [target]);
  const extra = typed.length > target.length ? typed.slice(target.length) : "";

  return (
    <div
      onClick={onFocus}
      dir={rtl ? "rtl" : "ltr"}
      className={cn(
        "relative cursor-text select-none rounded-2xl border border-border/60 bg-surface/30 p-6 md:p-8 font-mono leading-loose tracking-wider transition-all glass",
        active ? "border-primary/40 shadow-glow" : "",
        isCode ? "whitespace-pre text-xl md:text-2xl" : "text-2xl md:text-3xl",
      )}
    >
      <div
        className={cn("relative", isCode ? "max-h-96 overflow-auto" : "max-h-80 overflow-hidden")}
      >
        {chars.map((ch, i) => {
          const t = typed[i];
          const isCurrentWord = i >= currentWordStart && i < currentWordEnd;
          let cls = "text-typing-untyped";
          if (t !== undefined) {
            cls =
              t === ch
                ? "text-typing-correct"
                : ch === " " || ch === "\n"
                  ? "bg-typing-incorrect/25 text-typing-incorrect"
                  : "text-typing-incorrect underline decoration-typing-incorrect/60";
          }
          const isCaret = i === typed.length;
          return (
            <span
              key={i}
              className={cn(
                "relative",
                cls,
                isCurrentWord && t === undefined && "text-foreground/80",
              )}
            >
              {isCaret && active && (
                <span
                  className="pointer-events-none absolute -left-px top-0 h-[1.4em] w-0.5 bg-typing-caret animate-caret"
                  aria-hidden
                />
              )}
              {ch === "\n" ? <>{"\n"}</> : ch}
            </span>
          );
        })}
        {extra && (
          <span className="text-typing-extra underline decoration-typing-extra/60">{extra}</span>
        )}
        {typed.length === target.length && active && (
          <span className="absolute h-[1.4em] w-0.5 bg-typing-caret animate-caret" aria-hidden />
        )}
      </div>
    </div>
  );
}

function RestartShortcut({ onRestart }: { onRestart: () => void }) {
  useEffect(() => {
    let tabHeld = false;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Tab") tabHeld = true;
      if (e.key === "Enter" && tabHeld) {
        e.preventDefault();
        onRestart();
        tabHeld = false;
      }
      if (e.key === "Escape") {
        onRestart();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Tab") tabHeld = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onRestart]);
  return null;
}

export { AnimatePresence, motion };
