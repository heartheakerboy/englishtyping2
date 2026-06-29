// Practice categories with their own content generators.
export type CategoryId =
  | "general"
  | "gov-exams"
  | "coding"
  | "numbers"
  | "symbols"
  | "quotes"
  | "articles"
  | "books"
  | "stories"
  | "lessons";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { id: "general", label: "General", description: "Common words" },
  { id: "gov-exams", label: "Govt Exams", description: "Formal English passages" },
  { id: "coding", label: "Coding", description: "Snippets across languages" },
  { id: "numbers", label: "Numbers", description: "Digit & numeric drills" },
  { id: "symbols", label: "Symbols", description: "Punctuation & special chars" },
  { id: "quotes", label: "Quotes", description: "Famous quotations" },
  { id: "articles", label: "Articles", description: "News-style paragraphs" },
  { id: "books", label: "Books", description: "Classic literature" },
  { id: "stories", label: "Stories", description: "Short narrative prose" },
  { id: "lessons", label: "Custom Lessons", description: "Your saved drills" },
];

const GOV_EXAM_PASSAGES = [
  "The candidate must report to the examination centre at least thirty minutes before the scheduled time of the test. Mobile phones, smart watches, calculators and any other electronic devices are strictly prohibited inside the examination hall.",
  "In accordance with the notification issued by the commission, all eligible applicants are required to submit their detailed application form along with the requisite fee through the official online portal on or before the last date.",
  "The Government of India has launched a comprehensive scheme aimed at the welfare of farmers and rural workers, ensuring timely financial assistance, crop insurance, and access to modern agricultural technology across all states and union territories.",
];

const ARTICLES = [
  "Scientists have discovered a new method for converting atmospheric carbon dioxide into a stable solid material that can be used in construction. Early trials show the process could meaningfully reduce industrial emissions if scaled commercially.",
  "Markets opened sharply higher on Monday as investors responded to better than expected inflation data. Technology stocks led the gains, with several large cap names posting their strongest single day performance in over a year.",
];

const NUMBER_DRILLS = () => {
  const parts: string[] = [];
  for (let i = 0; i < 40; i++)
    parts.push(String(Math.floor(Math.random() * 100000)).padStart(2 + (i % 5), "0"));
  return parts.join(" ");
};

const SYMBOL_DRILLS = () => {
  const sym = "!@#$%^&*()_+-=[]{};:'\",.<>/?\\|`~";
  const parts: string[] = [];
  for (let i = 0; i < 40; i++) {
    let chunk = "";
    const len = 3 + Math.floor(Math.random() * 4);
    for (let j = 0; j < len; j++) chunk += sym[Math.floor(Math.random() * sym.length)];
    parts.push(chunk);
  }
  return parts.join(" ");
};

export function buildCategoryText(id: CategoryId, words: number, fallback: () => string): string {
  switch (id) {
    case "gov-exams":
      return GOV_EXAM_PASSAGES[Math.floor(Math.random() * GOV_EXAM_PASSAGES.length)];
    case "articles":
      return ARTICLES[Math.floor(Math.random() * ARTICLES.length)];
    case "numbers":
      return NUMBER_DRILLS();
    case "symbols":
      return SYMBOL_DRILLS();
    default:
      return fallback();
  }
  void words;
}
