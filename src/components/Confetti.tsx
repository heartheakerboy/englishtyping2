import confetti from "canvas-confetti";

export function fireConfetti(opts?: { intensity?: "low" | "medium" | "high" }) {
  if (typeof window === "undefined") return;
  const intensity = opts?.intensity ?? "medium";
  const count = intensity === "low" ? 60 : intensity === "high" ? 220 : 140;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#7c5cff", "#22d3ee", "#a78bfa", "#10b981", "#f472b6"],
  };
  function shot(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }
  shot(0.25, { spread: 26, startVelocity: 55 });
  shot(0.2, { spread: 60 });
  shot(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
  shot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  shot(0.1, { spread: 120, startVelocity: 45 });
}
