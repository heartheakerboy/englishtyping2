import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Header } from "@/components/Header";
import { TypingTest, type FinishedRun } from "@/components/TypingTest";
import { ResultScreen } from "@/components/ResultScreen";

export const Route = createFileRoute("/test/")({
  head: () => ({
    meta: [
      { title: "Free 60-Second Typing Speed Test — Live Chat & Net WPM Practice" },
      {
        name: "description",
        content:
          "Take a free 60-second typing test online. Check your real-time Net WPM, accuracy, CPM, and error breakdown. Practice for live chat customer support and job tests.",
      },
      {
        name: "keywords",
        content:
          "typing speed test 60 seconds, free typing test 60 seconds, live chat typing test 60 seconds, typing test 60 seconds, 60 second typing test, typing test online 60 seconds, wpm test",
      },
      { property: "og:title", content: "Free 60-Second Typing Speed Test — Live Chat & Net WPM" },
      {
        property: "og:description",
        content:
          "Take a free 60-second typing test. Measure WPM, accuracy, CPM, and error penalty in real time.",
      },
      { property: "og:url", content: "https://englishtypingtest.org/test" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free 60-Second Typing Speed Test — Live Chat & Net WPM" },
      {
        name: "twitter:description",
        content: "Take a free 60-second typing test. Check your net WPM and accuracy in real time.",
      },
    ],
    links: [{ rel: "canonical", href: "https://englishtypingtest.org/test" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "60-Second English Typing Test",
          url: "https://englishtypingtest.org/test",
          applicationCategory: "EducationalApplication",
          description: "Online 60-second typing test measuring Net WPM, accuracy, and keystroke errors.",
        }),
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
