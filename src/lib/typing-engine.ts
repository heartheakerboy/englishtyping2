export interface CharStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export interface LiveStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  cpm: number;
}

export interface WpmSample {
  t: number; // seconds since start
  wpm: number;
  rawWpm: number;
  errors: number;
}

export function computeLive(typed: string, target: string, elapsedSeconds: number): LiveStats {
  if (elapsedSeconds <= 0) return { wpm: 0, rawWpm: 0, accuracy: 100, cpm: 0 };
  let correct = 0;
  const len = Math.min(typed.length, target.length);
  for (let i = 0; i < len; i++) if (typed[i] === target[i]) correct++;
  const minutes = elapsedSeconds / 60;
  const wpm = correct / 5 / minutes;
  const rawWpm = typed.length / 5 / minutes;
  const accuracy = typed.length ? (correct / typed.length) * 100 : 100;
  return {
    wpm: Math.max(0, Math.round(wpm)),
    rawWpm: Math.max(0, Math.round(rawWpm)),
    accuracy: Math.round(accuracy * 10) / 10,
    cpm: Math.max(0, Math.round(correct / minutes)),
  };
}

export function computeCharStats(typed: string, target: string): CharStats {
  let correct = 0,
    incorrect = 0,
    extra = 0,
    missed = 0;
  const len = Math.max(typed.length, target.length);
  for (let i = 0; i < len; i++) {
    const t = typed[i];
    const g = target[i];
    if (t === undefined) missed++;
    else if (g === undefined) extra++;
    else if (t === g) correct++;
    else incorrect++;
  }
  return { correct, incorrect, extra, missed };
}

export function countMistakes(typed: string, target: string): number {
  let m = 0;
  const len = Math.min(typed.length, target.length);
  for (let i = 0; i < len; i++) if (typed[i] !== target[i]) m++;
  return m + Math.max(0, typed.length - target.length);
}

// Build a mistake frequency map per target character
export function buildMistakeMap(typed: string, target: string): Record<string, number> {
  const map: Record<string, number> = {};
  const len = Math.min(typed.length, target.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] !== target[i]) {
      const k = target[i] === " " ? "␣" : target[i];
      map[k] = (map[k] ?? 0) + 1;
    }
  }
  return map;
}

export function computeConsistency(wpmSamples: number[]): number {
  const samples = wpmSamples.filter((n) => n > 0);
  if (samples.length < 2) return 0;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean === 0) return 0;
  const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
  const sd = Math.sqrt(variance);
  const cv = sd / mean;
  return Math.max(0, Math.min(100, Math.round((1 - cv) * 1000) / 10));
}
