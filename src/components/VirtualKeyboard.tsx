import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LAYOUTS, buildKeyFingerMap, FINGER_COLORS, type LayoutId } from "@/lib/keyboard-layouts";

interface Props {
  layoutId: LayoutId;
  nextChar: string | undefined;
  showFingerGuide: boolean;
}

interface ModifierState {
  shift: boolean;
  caps: boolean;
  num: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

export function VirtualKeyboard({ layoutId, nextChar, showFingerGuide }: Props) {
  const layout = LAYOUTS[layoutId] ?? LAYOUTS.qwerty;
  const fingerMap = useMemo(() => buildKeyFingerMap(layout), [layout]);
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [mods, setMods] = useState<ModifierState>({
    shift: false,
    caps: false,
    num: false,
    ctrl: false,
    alt: false,
    meta: false,
  });

  useEffect(() => {
    const isShifted = (k: string) => k.length === 1 && /[A-Z!@#$%^&*()_+{}|:"<>?~]/.test(k);

    const onDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      setPressed((p) => new Set(p).add(key));
      setMods((m) => ({
        ...m,
        shift: e.shiftKey || isShifted(e.key),
        caps: e.getModifierState?.("CapsLock") ?? m.caps,
        num: e.getModifierState?.("NumLock") ?? m.num,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey,
      }));
    };
    const onUp = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      setPressed((p) => {
        const n = new Set(p);
        n.delete(key);
        return n;
      });
      setMods((m) => ({
        ...m,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey,
        caps: e.getModifierState?.("CapsLock") ?? m.caps,
        num: e.getModifierState?.("NumLock") ?? m.num,
      }));
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const nextKeyBase = nextChar?.toLowerCase();

  return (
    <div className="select-none rounded-2xl border border-border/60 bg-surface/40 p-3 md:p-4 glass">
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider">
        <ModBadge active={mods.shift} label="Shift" />
        <ModBadge active={mods.caps} label="Caps" />
        <ModBadge active={mods.num} label="Num" />
        <ModBadge active={mods.ctrl} label="Ctrl" />
        <ModBadge active={mods.alt} label="Alt" />
        <ModBadge active={mods.meta} label="⌘" />
        <span className="ml-auto text-muted-foreground">{layout.label}</span>
      </div>

      <div className="space-y-1.5">
        {layout.rows.map((r, ri) => (
          <div
            key={ri}
            className="flex justify-center gap-1.5"
            style={{ paddingLeft: `${ri * 12}px` }}
          >
            {r.map((k) => {
              const finger = fingerMap.get(k.base) ?? 0;
              const isNext = nextKeyBase === k.base || nextKeyBase === k.shift.toLowerCase();
              const isDown = pressed.has(k.base);
              return (
                <Key
                  key={`${ri}-${k.base}`}
                  base={k.base}
                  shift={k.shift}
                  showShift={mods.shift || mods.caps}
                  finger={finger}
                  isNext={isNext}
                  isDown={isDown}
                  showFingerGuide={showFingerGuide}
                />
              );
            })}
          </div>
        ))}

        <div className="flex justify-center gap-1.5">
          <div
            className={cn(
              "h-9 w-[55%] rounded-md border border-border/70 bg-surface text-center text-[10px] leading-9 text-muted-foreground transition-all",
              pressed.has(" ") && "border-primary bg-primary/20 text-primary",
              nextChar === " " && "ring-2 ring-primary/70 ring-offset-1 ring-offset-background",
              showFingerGuide && FINGER_COLORS[11],
            )}
          >
            space
          </div>
        </div>
      </div>
    </div>
  );
}

function Key({
  base,
  shift,
  showShift,
  finger,
  isNext,
  isDown,
  showFingerGuide,
}: {
  base: string;
  shift: string;
  showShift: boolean;
  finger: number;
  isNext: boolean;
  isDown: boolean;
  showFingerGuide: boolean;
}) {
  return (
    <motion.div
      animate={isDown ? { scale: 0.9, y: 2 } : { scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 25 }}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-surface font-mono text-xs text-foreground/80 transition-colors",
        showFingerGuide && FINGER_COLORS[finger],
        isNext &&
          "ring-2 ring-primary/70 ring-offset-1 ring-offset-background text-primary border-primary/60",
        isDown && "bg-primary text-primary-foreground border-primary",
      )}
    >
      {showShift && shift !== base ? shift : base}
    </motion.div>
  );
}

function ModBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wider transition-colors border",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border/60 text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
