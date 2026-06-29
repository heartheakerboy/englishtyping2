// Level curve: level = 1 + floor(sqrt(xp / 100))
export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function levelProgress(xp: number): {
  level: number;
  current: number;
  needed: number;
  pct: number;
} {
  const level = 1 + Math.floor(Math.sqrt(xp / 100));
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const current = xp - base;
  const needed = next - base;
  return { level, current, needed, pct: Math.min(100, Math.round((current / needed) * 100)) };
}
