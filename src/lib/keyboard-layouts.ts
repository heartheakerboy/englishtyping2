// Physical keyboard layouts + finger mapping for the virtual keyboard.
export type LayoutId = "qwerty" | "azerty" | "dvorak" | "colemak";

export interface KeyboardLayout {
  id: LayoutId;
  label: string;
  // Three rows of base/shifted character pairs.
  rows: { base: string; shift: string }[][];
}

// Helper to compress definition: each row is "base|shift base|shift ..."
function row(spec: string): { base: string; shift: string }[] {
  return spec.split(" ").map((tok) => {
    const [b, s] = tok.split("|");
    return { base: b, shift: s ?? b.toUpperCase() };
  });
}

export const LAYOUTS: Record<LayoutId, KeyboardLayout> = {
  qwerty: {
    id: "qwerty",
    label: "QWERTY",
    rows: [
      row("q w e r t y u i o p"),
      row("a s d f g h j k l ;|:"),
      row("z x c v b n m ,|< .|> /|?"),
    ],
  },
  azerty: {
    id: "azerty",
    label: "AZERTY",
    rows: [
      row("a z e r t y u i o p"),
      row("q s d f g h j k l m"),
      row("w x c v b n ,|? ;|. :|/ !|§"),
    ],
  },
  dvorak: {
    id: "dvorak",
    label: "Dvorak",
    rows: [
      row("'|\" ,|< .|> p y f g c r l"),
      row("a o e u i d h t n s -|_"),
      row(";|: q j k x b m w v z"),
    ],
  },
  colemak: {
    id: "colemak",
    label: "Colemak",
    rows: [
      row("q w f p g j l u y ;|:"),
      row("a r s t d h n e i o"),
      row("z x c v b k m ,|< .|> /|?"),
    ],
  },
};

export const LAYOUT_LIST = Object.values(LAYOUTS);

// Finger assignment (1..10, left pinky → right pinky)
// Color groups: 1/10 pink (pinky), 2/9 orange (ring), 3/8 yellow (middle),
// 4/7 green (index left/right), 5/6 blue (index reach), thumb=11 violet.
export const FINGER_COLORS: Record<number, string> = {
  1: "bg-pink-500/20 text-pink-600 dark:text-pink-300",
  2: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
  3: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  4: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
  5: "bg-sky-500/20 text-sky-600 dark:text-sky-300",
  6: "bg-sky-500/20 text-sky-600 dark:text-sky-300",
  7: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
  8: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  9: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
  10: "bg-pink-500/20 text-pink-600 dark:text-pink-300",
  11: "bg-violet-500/20 text-violet-600 dark:text-violet-300",
};

// Map column index → finger for the home row (10 cols → 10 fingers, 5/6 shared by index)
function fingerForCol(rowIdx: number, colIdx: number, rowLen: number): number {
  // Heuristic: distribute by column position
  // 0 → 1, 1 → 2, 2 → 3, 3 → 4, 4-5 → 4/5 then 7/6, etc.
  const map10 = [1, 2, 3, 4, 4, 7, 7, 8, 9, 10];
  if (rowLen <= 10) return map10[Math.min(colIdx, 9)];
  const scaled = Math.floor((colIdx / rowLen) * 10);
  return map10[Math.min(scaled, 9)];
  void rowIdx;
}

export function buildKeyFingerMap(layout: KeyboardLayout): Map<string, number> {
  const m = new Map<string, number>();
  layout.rows.forEach((r, ri) => {
    r.forEach((k, ci) => {
      const f = fingerForCol(ri, ci, r.length);
      m.set(k.base, f);
      m.set(k.shift, f);
    });
  });
  m.set(" ", 11);
  return m;
}
