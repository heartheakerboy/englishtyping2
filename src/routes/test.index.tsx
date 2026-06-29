import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Header } from "@/components/Header";
import { TypingTest, type FinishedRun } from "@/components/TypingTest";
import { ResultScreen } from "@/components/ResultScreen";

export const Route = createFileRoute("/test/")({
  head: () => ({
    meta: [
      { title: "Typing Test — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Take a free typing test. Live WPM, accuracy, CPM and mistakes tracking. Time, words, quote, code, and custom modes.",
      },
      { property: "og:title", content: "Typing Test — englishtypingtest.org" },
      {
        property: "og:description",
        content: "Take a free typing test with real-time WPM, accuracy and mistake tracking.",
      },
    ],
  }),
  component: TestPage,
});

function TestPage() {
  const [run, setRun] = useState<FinishedRun | null>(null);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-20 md:px-6 md:pt-16">
        <h1 className="sr-only">English Typing Test — Live WPM & Accuracy</h1>
        <AnimatePresence mode="wait">
          {run ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ResultScreen run={run} onRestart={() => setRun(null)} />
            </motion.div>
          ) : (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <TypingTest onFinish={setRun} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
