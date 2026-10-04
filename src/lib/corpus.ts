// Quote corpus — short, medium, long. All passages are original, written for typing practice.
export interface Quote {
  text: string;
  author: string;
  length: "short" | "medium" | "long";
}

export const QUOTES: Quote[] = [
  {
    text: "The morning train was already crowded when she boarded with her coffee. She found a seat by the window and watched the city wake up.",
    author: "Original",
    length: "short",
  },
  {
    text: "Clear communication saves more time than any shortcut. A short email written carefully can prevent a week of confusion.",
    author: "Original",
    length: "short",
  },
  {
    text: "Software updates often arrive at the worst possible moment. Saving your work before clicking install is a habit worth building.",
    author: "Original",
    length: "short",
  },
  {
    text: "Rain drummed softly on the roof as the garden drank deeply. By morning, the leaves would shine like polished glass.",
    author: "Original",
    length: "short",
  },
  {
    text: "Learning a new skill feels slow at first because your brain is building fresh pathways. Patience in the early weeks pays off for years.",
    author: "Original",
    length: "short",
  },
  {
    text: "A short walk after lunch does more for your energy than a second cup of coffee. Your body was designed to move between periods of rest.",
    author: "Original",
    length: "short",
  },
  {
    text: "Saturday mornings belong to the farmers market on the corner. The vendors remember regular customers and always slip an extra apple into the bag. Children weave between the stalls while their parents compare prices and recipes. It is the loudest, friendliest hour of the whole week.",
    author: "Original",
    length: "medium",
  },
  {
    text: "The team meeting started ten minutes late, as usual, but nobody minded this time. The project was finally ahead of schedule, and the mood in the room showed it. Someone had brought pastries to celebrate the milestone. Small rituals like this keep a group working well together.",
    author: "Original",
    length: "medium",
  },
  {
    text: "Cloud storage quietly changed how people think about their files. Documents no longer live on a single machine that could fail without warning. Instead, they sync across phones, tablets, and laptops in seconds. Losing a device is still annoying, but it no longer means losing your work.",
    author: "Original",
    length: "medium",
  },
  {
    text: "The river bends sharply around the old oak tree, and the current slows in the curve. Ducks gather there in the late afternoon, paddling in lazy circles. Sometimes a heron lands on the far bank and stands perfectly still for an hour. The whole scene feels untouched by the hurry of the town nearby.",
    author: "Original",
    length: "medium",
  },
  {
    text: "The best students are not always the fastest ones. They are the ones who return to difficult material a second and third time without frustration. Spaced repetition works because forgetting and relearning strengthens memory. Ten minutes of review each evening beats a five-hour cram session every time.",
    author: "Original",
    length: "medium",
  },
  {
    text: "Sleep is the foundation that diet and exercise are built on. A tired brain makes poor decisions about food and skips workouts without guilt. Seven to eight hours of consistent sleep improves focus, mood, and immunity. No supplement or shortcut can replace a regular bedtime.",
    author: "Original",
    length: "medium",
  },
  {
    text: "Moving to a new apartment always takes longer than planned. The boxes labeled kitchen somehow end up in the bedroom, and the bedroom boxes vanish entirely. Friends arrive with pizza and good intentions, but mostly they stand around debating where the sofa should go. By midnight, only the bed is assembled, and that feels like a victory. The first morning in a new place is strange and quiet. Then the kettle boils, the sun comes through unfamiliar windows, and it starts to feel like home.",
    author: "Original",
    length: "long",
  },
  {
    text: "Remote work gave people freedom, but it also blurred the line between the office and the living room. Without a commute, the workday can stretch silently into the evening. Successful remote workers protect their time with rituals: a morning walk that replaces the train ride, a lunch break taken away from the screen, a shutdown routine that marks the end of the day. Teams that communicate in writing tend to make better decisions than teams that rely on endless video calls. The future of work is not about where you sit. It is about how clearly you think and how reliably you deliver.",
    author: "Original",
    length: "long",
  },
  {
    text: "Artificial intelligence has moved from research papers into everyday tools in just a few years. It now drafts emails, summarizes meetings, and helps doctors read medical scans. This rapid progress excites engineers and worries everyone else in equal measure. The honest answer is that nobody fully knows how these systems will reshape jobs and education. What is certain is that people who learn to work alongside these tools will have an advantage. Curiosity, not fear, is the right response to new technology.",
    author: "Original",
    length: "long",
  },
  {
    text: "High in the mountains, the air grows thin and every sound carries farther than it should. A distant waterfall becomes a constant low hum beneath the wind. Wildflowers bloom in the short summer with an urgency that lowland plants never show. Marmots whistle warnings to each other across the rocky slopes. Hikers who reach the pass at sunrise see the valleys below filled with a sea of clouds. For a few minutes, the whole world feels quiet, clean, and impossibly large.",
    author: "Original",
    length: "long",
  },
  {
    text: "Every expert was once a beginner who refused to quit on a bad day. The difference between those who master a skill and those who abandon it is rarely talent. It is the willingness to practice the boring fundamentals long after the novelty fades. Musicians play scales, athletes drill footwork, and writers rewrite the same paragraph ten times. Progress is invisible day to day, which is why most people stop too early. Keep a record of where you started, and compare yourself to your past self instead of to experts.",
    author: "Original",
    length: "long",
  },
  {
    text: "The human body responds remarkably well to small, consistent habits. Drinking water before coffee, taking the stairs instead of the elevator, and stretching for five minutes each morning all seem too minor to matter. Yet these tiny choices compound over months into real changes in energy and strength. Crash diets and extreme workout programs fail because they demand too much change at once. Sustainable health comes from routines you can maintain on your worst day, not your best. Start with one habit, protect it for a month, and then add another.",
    author: "Original",
    length: "long",
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
