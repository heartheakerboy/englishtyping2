import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LAYOUTS, type LayoutId } from "@/lib/keyboard-layouts";
import { Flame, Info, AlertTriangle, CheckCircle, Keyboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  mistakeMap: Record<string, number>;
  targetText: string;
  typedText: string;
  layoutId?: LayoutId;
}

// Key definitions with width weights for realistic keyboard layout
interface HeatKey {
  base: string;
  shift: string;
  display?: string;
  width?: string; // flex-grow or specific min-w
  isSpecial?: boolean;
}

const KEYBOARD_ROWS: HeatKey[][] = [
  // Row 0: Numbers & Symbols
  [
    { base: "`", shift: "~" },
    { base: "1", shift: "!" },
    { base: "2", shift: "@" },
    { base: "3", shift: "#" },
    { base: "4", shift: "$" },
    { base: "5", shift: "%" },
    { base: "6", shift: "^" },
    { base: "7", shift: "&" },
    { base: "8", shift: "*" },
    { base: "9", shift: "(" },
    { base: "0", shift: ")" },
    { base: "-", shift: "_" },
    { base: "=", shift: "+" },
    { base: "backspace", shift: "backspace", display: "⌫ Back", width: "w-14 sm:w-16", isSpecial: true },
  ],
  // Row 1: QWERTY Row
  [
    { base: "tab", shift: "tab", display: "Tab", width: "w-12 sm:w-14", isSpecial: true },
    { base: "q", shift: "Q" },
    { base: "w", shift: "W" },
    { base: "e", shift: "E" },
    { base: "r", shift: "R" },
    { base: "t", shift: "T" },
    { base: "y", shift: "Y" },
    { base: "u", shift: "U" },
    { base: "i", shift: "I" },
    { base: "o", shift: "O" },
    { base: "p", shift: "P" },
    { base: "[", shift: "{" },
    { base: "]", shift: "}" },
    { base: "\\", shift: "|", width: "w-10 sm:w-12" },
  ],
  // Row 2: Home Row
  [
    { base: "caps", shift: "caps", display: "Caps", width: "w-14 sm:w-16", isSpecial: true },
    { base: "a", shift: "A" },
    { base: "s", shift: "S" },
    { base: "d", shift: "D" },
    { base: "f", shift: "F" },
    { base: "g", shift: "G" },
    { base: "h", shift: "H" },
    { base: "j", shift: "J" },
    { base: "k", shift: "K" },
    { base: "l", shift: "L" },
    { base: ";", shift: ":" },
    { base: "'", shift: '"' },
    { base: "enter", shift: "enter", display: "↵ Enter", width: "w-14 sm:w-20", isSpecial: true },
  ],
  // Row 3: Bottom Row
  [
    { base: "shift_l", shift: "shift_l", display: "⇧ Shift", width: "w-16 sm:w-20", isSpecial: true },
    { base: "z", shift: "Z" },
    { base: "x", shift: "X" },
    { base: "c", shift: "C" },
    { base: "v", shift: "V" },
    { base: "b", shift: "B" },
    { base: "n", shift: "N" },
    { base: "m", shift: "M" },
    { base: ",", shift: "<" },
    { base: ".", shift: ">" },
    { base: "/", shift: "?" },
    { base: "shift_r", shift: "shift_r", display: "⇧ Shift", width: "w-16 sm:w-20", isSpecial: true },
  ],
  // Row 4: Spacebar Row
  [
    { base: "ctrl_l", shift: "ctrl_l", display: "Ctrl", width: "w-10 sm:w-12", isSpecial: true },
    { base: "alt_l", shift: "alt_l", display: "Alt", width: "w-10 sm:w-12", isSpecial: true },
    { base: " ", shift: " ", display: "␣ Spacebar", width: "flex-1 max-w-sm" },
    { base: "alt_r", shift: "alt_r", display: "Alt", width: "w-10 sm:w-12", isSpecial: true },
    { base: "ctrl_r", shift: "ctrl_r", display: "Ctrl", width: "w-10 sm:w-12", isSpecial: true },
  ],
];

// Finger Mapping
const KEY_FINGER_MAP: Record<string, { finger: string; hand: "Left" | "Right" | "Thumb" }> = {
  // Left Pinky
  "`": { finger: "Left Pinky", hand: "Left" },
  "1": { finger: "Left Pinky", hand: "Left" },
  "q": { finger: "Left Pinky", hand: "Left" },
  "a": { finger: "Left Pinky", hand: "Left" },
  "z": { finger: "Left Pinky", hand: "Left" },
  // Left Ring
  "2": { finger: "Left Ring", hand: "Left" },
  "w": { finger: "Left Ring", hand: "Left" },
  "s": { finger: "Left Ring", hand: "Left" },
  "x": { finger: "Left Ring", hand: "Left" },
  // Left Middle
  "3": { finger: "Left Middle", hand: "Left" },
  "e": { finger: "Left Middle", hand: "Left" },
  "d": { finger: "Left Middle", hand: "Left" },
  "c": { finger: "Left Middle", hand: "Left" },
  // Left Index
  "4": { finger: "Left Index", hand: "Left" },
  "5": { finger: "Left Index", hand: "Left" },
  "r": { finger: "Left Index", hand: "Left" },
  "t": { finger: "Left Index", hand: "Left" },
  "f": { finger: "Left Index", hand: "Left" },
  "g": { finger: "Left Index", hand: "Left" },
  "v": { finger: "Left Index", hand: "Left" },
  "b": { finger: "Left Index", hand: "Left" },
  // Right Index
  "6": { finger: "Right Index", hand: "Right" },
  "7": { finger: "Right Index", hand: "Right" },
  "y": { finger: "Right Index", hand: "Right" },
  "u": { finger: "Right Index", hand: "Right" },
  "h": { finger: "Right Index", hand: "Right" },
  "j": { finger: "Right Index", hand: "Right" },
  "n": { finger: "Right Index", hand: "Right" },
  "m": { finger: "Right Index", hand: "Right" },
  // Right Middle
  "8": { finger: "Right Middle", hand: "Right" },
  "i": { finger: "Right Middle", hand: "Right" },
  "k": { finger: "Right Middle", hand: "Right" },
  ",": { finger: "Right Middle", hand: "Right" },
  // Right Ring
  "9": { finger: "Right Ring", hand: "Right" },
  "o": { finger: "Right Ring", hand: "Right" },
  "l": { finger: "Right Ring", hand: "Right" },
  ".": { finger: "Right Ring", hand: "Right" },
  // Right Pinky
  "0": { finger: "Right Pinky", hand: "Right" },
  "-": { finger: "Right Pinky", hand: "Right" },
  "=": { finger: "Right Pinky", hand: "Right" },
  "p": { finger: "Right Pinky", hand: "Right" },
  "[": { finger: "Right Pinky", hand: "Right" },
  "]": { finger: "Right Pinky", hand: "Right" },
  "\\": { finger: "Right Pinky", hand: "Right" },
  ";": { finger: "Right Pinky", hand: "Right" },
  "'": { finger: "Right Pinky", hand: "Right" },
  "/": { finger: "Right Pinky", hand: "Right" },
  // Thumbs
  " ": { finger: "Thumbs", hand: "Thumb" },
};

export function KeyboardMistakeHeatmap({
  mistakeMap,
  targetText,
  typedText,
  layoutId = "qwerty",
}: Props) {
  const [hoveredKey, setHoveredKey] = useState<{
    char: string;
    mistakes: number;
    total: number;
    accuracy: number;
    finger: string;
  } | null>(null);

  // Compute character counts in target text (lowercase + space normalized)
  const charStats = useMemo(() => {
    const targetFreq: Record<string, number> = {};
    const mistakeFreq: Record<string, number> = {};

    // Normalize target characters
    for (const ch of targetText) {
      const k = ch === " " ? " " : ch.toLowerCase();
      targetFreq[k] = (targetFreq[k] ?? 0) + 1;
    }

    // Process mistakeMap
    for (const [ch, count] of Object.entries(mistakeMap)) {
      const k = ch === "␣" || ch === " " ? " " : ch.toLowerCase();
      mistakeFreq[k] = (mistakeFreq[k] ?? 0) + count;
    }

    // Finger error accumulator
    const fingerErrors: Record<string, number> = {
      "Left Pinky": 0,
      "Left Ring": 0,
      "Left Middle": 0,
      "Left Index": 0,
      "Right Index": 0,
      "Right Middle": 0,
      "Right Ring": 0,
      "Right Pinky": 0,
      "Thumbs": 0,
    };

    let totalErrors = 0;
    for (const [k, errCount] of Object.entries(mistakeFreq)) {
      totalErrors += errCount;
      const fingerInfo = KEY_FINGER_MAP[k];
      if (fingerInfo) {
        fingerErrors[fingerInfo.finger] = (fingerErrors[fingerInfo.finger] ?? 0) + errCount;
      }
    }

    // Find worst finger
    let worstFinger = "";
    let maxFingerErrors = 0;
    for (const [finger, count] of Object.entries(fingerErrors)) {
      if (count > maxFingerErrors) {
        maxFingerErrors = count;
        worstFinger = finger;
      }
    }

    return {
      targetFreq,
      mistakeFreq,
      fingerErrors,
      totalErrors,
      worstFinger,
      worstFingerPercent: totalErrors > 0 ? Math.round((maxFingerErrors / totalErrors) * 100) : 0,
    };
  }, [mistakeMap, targetText]);

  // Determine heat level and styling for a key
  const getKeyHeatStyle = (key: HeatKey) => {
    if (key.isSpecial) {
      return "bg-surface/60 border-border/40 text-muted-foreground/60";
    }

    const baseChar = key.base;
    const shiftChar = key.shift.toLowerCase();
    const mistakes = (charStats.mistakeFreq[baseChar] ?? 0) + (charStats.mistakeFreq[shiftChar] ?? 0);
    const totalTyped = (charStats.targetFreq[baseChar] ?? 0) + (charStats.targetFreq[shiftChar] ?? 0);

    // If key was never part of target text in this session
    if (totalTyped === 0 && mistakes === 0) {
      return "bg-surface/30 border-border/30 text-muted-foreground/40";
    }

    // Perfect Accuracy (No mistakes)
    if (mistakes === 0 && totalTyped > 0) {
      return "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30";
    }

    // Low Mistake rate (1 mistake)
    if (mistakes === 1) {
      return "bg-yellow-500/25 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/35";
    }

    // Medium Mistake rate (2-3 mistakes)
    if (mistakes >= 2 && mistakes <= 3) {
      return "bg-amber-500/35 border-amber-500/60 text-amber-200 hover:bg-amber-500/45";
    }

    // High / Critical Mistake rate (4+ mistakes)
    return "bg-rose-500/40 border-rose-500/80 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.35)] hover:bg-rose-500/50 animate-pulse";
  };

  const handleKeyHover = (key: HeatKey) => {
    if (key.isSpecial) {
      setHoveredKey(null);
      return;
    }
    const baseChar = key.base;
    const mistakes = charStats.mistakeFreq[baseChar] ?? 0;
    const total = charStats.targetFreq[baseChar] ?? 0;
    const accuracy = total > 0 ? Math.max(0, Math.round(((total - mistakes) / total) * 100)) : 100;
    const fingerInfo = KEY_FINGER_MAP[baseChar]?.finger ?? "Unassigned";

    setHoveredKey({
      char: key.display ?? key.shift ?? key.base.toUpperCase(),
      mistakes,
      total,
      accuracy,
      finger: fingerInfo,
    });
  };

  return (
    <Card className="border-border/70 bg-surface/60 p-4 backdrop-blur md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              Keyboard Mistake Heatmap
              <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300 text-[10px] py-0">
                Heat Gradient
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Hover over any key to inspect typo frequency and finger assignment.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/60" /> 0 Errors
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-yellow-500/40 border border-yellow-500/60" /> 1 Error
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/50 border border-amber-500/70" /> 2-3 Errors
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500/60 border border-rose-500/90" /> 4+ Errors
          </span>
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="overflow-x-auto py-2">
        <div className="min-w-[620px] space-y-1.5 p-2 rounded-xl bg-background/50 border border-border/40">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((key, keyIdx) => {
                const heatClass = getKeyHeatStyle(key);
                const isSpace = key.base === " ";

                return (
                  <div
                    key={keyIdx}
                    onMouseEnter={() => handleKeyHover(key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-lg border text-xs font-mono font-medium transition-all duration-150 cursor-pointer select-none",
                      key.width ?? "w-8 sm:w-10",
                      isSpace ? "h-9 sm:h-10" : "h-9 sm:h-10",
                      heatClass
                    )}
                  >
                    {key.display ? (
                      <span className="text-[10px] sm:text-xs">{key.display}</span>
                    ) : (
                      <>
                        <span className="text-[9px] text-muted-foreground/70 leading-none">
                          {key.shift !== key.base.toUpperCase() ? key.shift : ""}
                        </span>
                        <span className="text-xs sm:text-sm font-bold uppercase leading-none mt-0.5">
                          {key.base}
                        </span>
                      </>
                    )}

                    {/* Mistake Count Badge if errors > 0 */}
                    {!key.isSpecial && (charStats.mistakeFreq[key.base] ?? 0) > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm">
                        {charStats.mistakeFreq[key.base]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Key Diagnostic Tooltip & Finger Breakdown Banner */}
      <div className="grid gap-3 sm:grid-cols-2 pt-1">
        {/* Key Diagnostic Box */}
        <div className="rounded-lg border border-border/60 bg-background/60 p-3 flex items-center justify-between min-h-[58px]">
          {hoveredKey ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10 font-mono text-base font-bold text-primary">
                  {hoveredKey.char}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Assigned: {hoveredKey.finger}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Target frequency: {hoveredKey.total} times
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-xs font-bold font-mono",
                  hoveredKey.mistakes === 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {hoveredKey.mistakes} Typos ({hoveredKey.accuracy}% Acc)
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-primary" />
              <span>Hover over any letter on the heatmap for individual finger stats.</span>
            </div>
          )}
        </div>

        {/* Weakest Finger Recommendation Card */}
        <div className="rounded-lg border border-border/60 bg-background/60 p-3 flex items-center gap-2.5">
          {charStats.totalErrors === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span><strong>Flawless Touch Typing!</strong> Zero keystroke errors detected on this test run.</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">
                  Weakest Finger: {charStats.worstFinger}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Accounted for {charStats.worstFingerPercent}% of your mistakes ({charStats.fingerErrors[charStats.worstFinger]} errors). Focus on relaxing this finger during warmup drills.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
