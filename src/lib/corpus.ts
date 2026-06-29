// Quote corpus — short, medium, long. Public domain / common knowledge.
export interface Quote {
  text: string;
  author: string;
  length: "short" | "medium" | "long";
}

export const QUOTES: Quote[] = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    length: "short",
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    length: "short",
  },
  {
    text: "Whether you think you can or think you can't, you are right.",
    author: "Henry Ford",
    length: "short",
  },
  { text: "Stay hungry, stay foolish.", author: "Stewart Brand", length: "short" },
  {
    text: "Design is not just what it looks like and feels like. Design is how it works. That is why we have to make products that are meaningful, beautiful, and useful all at once.",
    author: "Steve Jobs",
    length: "medium",
  },
  {
    text: "The best way to predict the future is to invent it. The future is not laid out on a track. It is something that we can decide, and to the extent that we do not violate any known laws of the universe, we can probably make it work the way that we want to.",
    author: "Alan Kay",
    length: "long",
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    length: "medium",
  },
  {
    text: "Any sufficiently advanced technology is indistinguishable from magic. The line between technology and magic blurs when our understanding is incomplete.",
    author: "Arthur C. Clarke",
    length: "medium",
  },
  {
    text: "Premature optimization is the root of all evil in programming. We should forget about small efficiencies, say about 97% of the time. Yet we should not pass up our opportunities in that critical 3%.",
    author: "Donald Knuth",
    length: "long",
  },
  {
    text: "Walking on water and developing software from a specification are easy if both are frozen.",
    author: "Edward V. Berard",
    length: "short",
  },
];

// Short story / narrative paragraphs (original prose)
export const STORIES: string[] = [
  "The lighthouse keeper had not seen another human in three years. Every morning she climbed the spiral stairs, lit the great lamp, and watched the sea for ships that never came. The wind carried only the cries of gulls and the slow rhythm of waves against the rocks below.",
  "Marcus opened the small wooden box his grandfather had left him. Inside, wrapped in faded velvet, lay a brass key and a letter written in careful, sloping script. The letter began with a single sentence that changed everything he thought he knew about his family.",
  "The train pulled into the empty station at midnight. Snow fell in heavy, silent sheets, covering the platform and the single bench where she sat with her suitcase. She had been waiting for hours. She would wait, she had decided, for as long as it took.",
  "In the small village at the edge of the forest, people whispered about the old woman who lived in the cottage by the river. They said she could speak to the wind, that the deer came to her hand without fear, and that her garden bloomed in every season.",
];

// Book excerpts (public domain classics)
export const BOOKS: string[] = [
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness.",
  "Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
  "Happy families are all alike; every unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl.",
  "All children, except one, grow up. They soon know that they will grow up, and the way Wendy knew was this. One day when she was two years old she was playing in a garden, and she plucked another flower and ran with it to her mother.",
];

// Code snippets for practice (typed faithfully including punctuation)
export const CODE_SNIPPETS: { lang: string; code: string }[] = [
  {
    lang: "typescript",
    code: `function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {\n  let id: number | undefined;\n  return (...args: Parameters<T>) => {\n    if (id) clearTimeout(id);\n    id = window.setTimeout(() => fn(...args), ms);\n  };\n}`,
  },
  {
    lang: "javascript",
    code: `const fibonacci = (n) => {\n  if (n < 2) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];\n  return b;\n};`,
  },
  {
    lang: "python",
    code: `def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    mid = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + mid + quicksort(right)`,
  },
];

export function pickQuote(length: "short" | "medium" | "long"): Quote {
  const pool = QUOTES.filter((q) => q.length === length);
  const arr = pool.length ? pool : QUOTES;
  return arr[Math.floor(Math.random() * arr.length)];
}
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
