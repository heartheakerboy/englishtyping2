// Short, arcade-friendly word pools by difficulty.
// Short words for early waves, longer/trickier for later ones.

const EASY = [
  "cat",
  "dog",
  "run",
  "jump",
  "go",
  "sun",
  "sky",
  "red",
  "blue",
  "fast",
  "code",
  "play",
  "win",
  "fun",
  "key",
  "hit",
  "aim",
  "fox",
  "fly",
  "ice",
  "leaf",
  "moon",
  "star",
  "wave",
  "road",
  "tree",
  "fish",
  "bird",
  "door",
  "game",
  "rock",
  "fire",
  "gold",
  "line",
  "ring",
  "time",
  "ball",
  "cake",
  "bear",
  "cake",
];

const MEDIUM = [
  "rocket",
  "shadow",
  "planet",
  "danger",
  "escape",
  "forest",
  "sniper",
  "stream",
  "battle",
  "engine",
  "ninja",
  "puzzle",
  "temple",
  "quest",
  "castle",
  "laser",
  "matrix",
  "mystic",
  "tundra",
  "jungle",
  "shield",
  "arrow",
  "portal",
  "wizard",
  "poison",
  "frozen",
  "silver",
  "copper",
  "golden",
  "cosmic",
  "thunder",
  "comet",
  "orbit",
  "viper",
  "raven",
  "spider",
  "hornet",
  "tiger",
  "falcon",
  "panda",
];

const HARD = [
  "asteroid",
  "catastrophe",
  "dimension",
  "equilibrium",
  "fortitude",
  "gravitational",
  "horizon",
  "ingenious",
  "kaleidoscope",
  "luminescent",
  "metamorphic",
  "navigation",
  "oscillator",
  "pyramidal",
  "quintessence",
  "resilience",
  "supersonic",
  "trajectory",
  "ultraviolet",
  "verifiable",
  "whirlwind",
  "xenophobia",
  "yearning",
  "zealously",
  "cryptogram",
  "biorhythm",
  "encyclopedia",
  "hydroelectric",
];

const BOSS = [
  "annihilation",
  "obliteration",
  "catastrophic",
  "invincible",
  "unstoppable",
  "apocalypse",
  "thunderstorm",
  "supernova",
  "extermination",
  "megalomania",
];

export type GameDifficulty = "easy" | "medium" | "hard";

export function pickWord(difficulty: GameDifficulty, level: number, exclude: Set<string>): string {
  // Mix harder words as level rises.
  const r = Math.random();
  let pool: string[];
  if (difficulty === "easy") {
    pool = r < 0.7 ? EASY : MEDIUM;
  } else if (difficulty === "medium") {
    pool = r < 0.45 + Math.min(0.3, level * 0.03) ? MEDIUM : r < 0.85 ? EASY : HARD;
  } else {
    pool = r < 0.5 ? HARD : MEDIUM;
  }
  for (let i = 0; i < 6; i++) {
    const w = pool[Math.floor(Math.random() * pool.length)];
    if (!exclude.has(w)) return w;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickBossWord(): string {
  return BOSS[Math.floor(Math.random() * BOSS.length)];
}
