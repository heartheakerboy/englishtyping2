// Tiny WebAudio sound FX — no asset files needed.
let ctx: AudioContext | null = null;
let enabled = true;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
  if (typeof window !== "undefined") localStorage.setItem("ett-sound", v ? "1" : "0");
}
export function isSoundEnabled() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("ett-sound") !== "0";
}

function tone(freq: number, durationMs: number, type: OscillatorType = "sine", gain = 0.06) {
  if (!enabled || !isSoundEnabled()) return;
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(gain, a.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + durationMs / 1000);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + durationMs / 1000 + 0.02);
}

export const sfx = {
  tick: () => tone(880, 60, "square", 0.04),
  countdown: () => tone(660, 140, "triangle", 0.08),
  go: () => {
    tone(880, 220, "triangle", 0.1);
    setTimeout(() => tone(1320, 320, "triangle", 0.08), 80);
  },
  finish: () => {
    tone(660, 120, "sine", 0.08);
    setTimeout(() => tone(990, 180, "sine", 0.08), 120);
    setTimeout(() => tone(1320, 260, "sine", 0.08), 260);
  },
  fail: () => tone(180, 240, "sawtooth", 0.06),
  notify: () => tone(1200, 90, "sine", 0.05),
  click: () => tone(420, 30, "square", 0.03),
};
