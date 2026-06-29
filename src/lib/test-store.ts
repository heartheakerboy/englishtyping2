import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LanguageCode } from "./languages";
import type { LayoutId } from "./keyboard-layouts";
import type { CategoryId } from "./categories";

export type TestMode = "time" | "words" | "quote" | "paragraph" | "code" | "custom" | "ai";
export type ContentKind = "common" | "quotes" | "stories" | "books" | "code";

export const TIME_VALUES = [15, 30, 60, 120, 300, 600, 900, 1800] as const;
export const WORD_VALUES = [10, 25, 50, 100, 200] as const;
export const QUOTE_LENGTHS = ["short", "medium", "long"] as const;
export type QuoteLength = (typeof QUOTE_LENGTHS)[number];

interface TestConfigState {
  mode: TestMode;
  timeSeconds: number;
  wordCount: number;
  quoteLength: QuoteLength;
  customText: string;
  customSeed: number;

  // New
  language: LanguageCode;
  layout: LayoutId;
  category: CategoryId;
  showKeyboard: boolean;
  showFingerGuide: boolean;
  aiText: string; // last AI-generated text

  set: (patch: Partial<Omit<TestConfigState, "set" | "regen">>) => void;
  regen: () => void;
}

export const useTestConfig = create<TestConfigState>()(
  persist(
    (set) => ({
      mode: "time",
      timeSeconds: 30,
      wordCount: 50,
      quoteLength: "medium",
      customText: "",
      customSeed: 0,
      language: "english",
      layout: "qwerty",
      category: "general",
      showKeyboard: false,
      showFingerGuide: true,
      aiText: "",
      set: (patch) => set(patch),
      regen: () => set((s) => ({ customSeed: s.customSeed + 1 })),
    }),
    {
      name: "ett-test-config",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as never) : localStorage,
      ),
      partialize: (s) => ({
        mode: s.mode,
        timeSeconds: s.timeSeconds,
        wordCount: s.wordCount,
        quoteLength: s.quoteLength,
        customText: s.customText,
        language: s.language,
        layout: s.layout,
        category: s.category,
        showKeyboard: s.showKeyboard,
        showFingerGuide: s.showFingerGuide,
      }),
    },
  ),
);
