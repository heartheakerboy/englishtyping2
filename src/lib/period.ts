// Period-key helpers used by missions (UTC).
export function dailyKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
export function weeklyKey(d = new Date()): string {
  // ISO week (Mon-Sun)
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
export function monthlyKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
export function keyForScope(scope: "daily" | "weekly" | "monthly", d = new Date()) {
  return scope === "daily" ? dailyKey(d) : scope === "weekly" ? weeklyKey(d) : monthlyKey(d);
}
