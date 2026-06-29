import { useMemo } from "react";

type Day = { date: string; count: number; maxWpm: number };

export function Heatmap({ data }: { data: Day[] }) {
  const map = useMemo(() => {
    const m = new Map<string, Day>();
    for (const d of data) m.set(d.date, d);
    return m;
  }, [data]);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 364);
  // Align start to Sunday
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const weeks: Array<Array<{ date: string; day: Day | null; inRange: boolean }>> = [];
  const cursor = new Date(start);
  for (let w = 0; w < 53; w++) {
    const week: Array<{ date: string; day: Day | null; inRange: boolean }> = [];
    for (let d = 0; d < 7; d++) {
      const key = cursor.toISOString().slice(0, 10);
      week.push({
        date: key,
        day: map.get(key) ?? null,
        inRange: cursor >= start && cursor <= today,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  function level(count: number) {
    if (!count) return 0;
    if (count < 2) return 1;
    if (count < 5) return 2;
    if (count < 10) return 3;
    return 4;
  }

  const levelClass = [
    "bg-surface/60",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/70",
    "bg-primary shadow-glow",
  ];

  const totalDays = data.filter((d) => d.count > 0).length;
  const totalTests = data.reduce((a, d) => a + d.count, 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div>
          <span className="font-mono text-foreground tabular-nums">{totalTests}</span> tests over{" "}
          <span className="font-mono text-foreground tabular-nums">{totalDays}</span> active days
        </div>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {levelClass.map((c, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={
                    cell.day
                      ? `${cell.date} — ${cell.day.count} test(s), best ${cell.day.maxWpm.toFixed(0)} WPM`
                      : cell.date
                  }
                  className={`h-2.5 w-2.5 rounded-sm transition-transform hover:scale-125 ${
                    cell.inRange ? levelClass[level(cell.day?.count ?? 0)] : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
