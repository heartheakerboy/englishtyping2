import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Printer,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { fireConfetti } from "@/components/Confetti";

export const Route = createFileRoute("/gcc-tbc-typing-test")({
  head: () => ({
    meta: [
      {
        title: "GCC-TBC 30 & 40 WPM English Typing Test (7 Minutes) — Official Exam Practice",
      },
      {
        name: "description",
        content:
          "Practice official 7-minute GCC-TBC English typing test for 30 WPM and 40 WPM exams. Real exam passages, mistake deduction rules, Net WPM calculation, and printable scorecard.",
      },
      {
        name: "keywords",
        content:
          "gcc-tbc 40 wpm english typing 7 minutes passage, english typing test online 7 minutes, 7 minute typing test, 40 typing passage 7 minutes, english 30 typing passage 7 minutes, body typing in 7 minutes, typing test 7 minutes paragraph, gcc english 40 wpm practice test 7min",
      },
      {
        property: "og:title",
        content: "GCC-TBC 30 & 40 WPM English Typing Test 7 Minutes — Exam Practice",
      },
      {
        property: "og:description",
        content:
          "Official 7-minute exam simulation for GCC-TBC 30 WPM & 40 WPM. Authentic passages, instant net WPM grading, and mistake penalty scorecard.",
      },
      { property: "og:url", content: "https://englishtypingtest.org/gcc-tbc-typing-test" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "GCC-TBC 30 & 40 WPM English Typing Test 7 Minutes",
      },
      {
        name: "twitter:description",
        content:
          "Practice official 7-minute GCC-TBC passages. Real-time net WPM, mistake penalties, and pass/fail scorecard.",
      },
    ],
    links: [{ rel: "canonical", href: "https://englishtypingtest.org/gcc-tbc-typing-test" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "GCC-TBC 7-Minute English Typing Test Practice",
          url: "https://englishtypingtest.org/gcc-tbc-typing-test",
          applicationCategory: "EducationalApplication",
          operatingSystem: "All",
          description:
            "Official 7-minute GCC-TBC typing test simulator for 30 WPM and 40 WPM exam candidates.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is the duration and speed requirement of GCC-TBC English Typing Exam?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The GCC-TBC English typing exam duration is exactly 7 minutes (420 seconds). For 30 WPM, candidates must type approximately 210 words (1,050 keystrokes). For 40 WPM, candidates must type approximately 280 words (1,400 keystrokes).",
              },
            },
            {
              "@type": "Question",
              name: "How is Net WPM and mistake penalty calculated in GCC-TBC 7-Minute Test?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Gross WPM is total words typed divided by 7 minutes. Each mistake incurs a penalty deduction. Net WPM = (Total Keystrokes / 5 - Mistakes Penalty) / 7. A minimum accuracy of 90% and Net WPM matching the exam grade is required to pass.",
              },
            },
            {
              "@type": "Question",
              name: "What are the passing marks and grades in GCC-TBC typing exams?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Candidates scoring 90% and above get Grade 'A' (Distinction). Candidates scoring 75% to 89% receive Grade 'B' (First Class). Candidates scoring 60% to 74% receive Grade 'C' (Pass). Below 60% or failing to meet minimum net WPM results in Fail.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: GccTbcPage,
});

// Authentic GCC-TBC 30 & 40 WPM Passages (Business Letters, Notices, and Administrative Statements)
const GCC_PASSAGES = [
  {
    id: "passage-30-1",
    wpmTarget: 30,
    title: "Passage 1: Importance of Digital Education & Computer Literacy",
    text: "Education is the primary foundation for the economic and cultural development of any society. In modern times, computer literacy has become as essential as basic reading and writing skills. Computers help students learn complex concepts through visual graphics, interactive simulations, and global knowledge repositories. Today, government institutions, banks, and private organizations function entirely on digital frameworks. Learning fast and accurate keyboard typing enables individuals to perform administrative duties with higher efficiency. A student who masters keyboard typing with high precision saves considerable time and minimizes procedural errors. Therefore, every educational institution should prioritize computer typing practice from an early age to prepare candidates for future administrative and technical examinations.",
  },
  {
    id: "passage-30-2",
    wpmTarget: 30,
    title: "Passage 2: Environmental Protection & Sustainable Energy",
    text: "The protection of natural resources and environmental preservation is one of the most critical responsibilities of modern citizens. Industrial expansion, deforestation, and uncontrolled vehicle emissions have led to severe global warming and climate disturbances. To overcome these hazards, we must transition towards renewable energy sources such as solar power, wind turbines, and hydroelectric systems. Solar panels installed on residential and commercial buildings generate clean electricity while significantly lowering carbon footprints. Furthermore, conserving drinking water, planting trees across urban corridors, and recycling plastic waste will safeguard ecological stability. Every small individual effort contributes towards a cleaner, greener, and sustainable planet for future generations.",
  },
  {
    id: "passage-40-1",
    wpmTarget: 40,
    title: "Passage 3: Modern Banking Systems & Financial Technology",
    text: "The financial sector has undergone a revolutionary transformation with the introduction of electronic banking, real-time gross settlement systems, and unified payment interfaces. Earlier, bank customers had to stand in long queues to deposit currency, verify passbook balances, or transfer funds across distant branches. Today, internet banking portals and mobile applications empower users to execute secure financial transactions within fractions of a second. The implementation of advanced cryptographic protocols and biometric authentication ensures customer confidentiality while mitigating cyber threats. Furthermore, digital transaction statements provide seamless financial tracking for tax auditing, corporate accounting, and personal budget planning. Commercial organizations now require office executives to possess rapid typing capabilities along with numeric data entry proficiency to process thousands of financial records daily without discrepancy.",
  },
  {
    id: "passage-40-2",
    wpmTarget: 40,
    title: "Passage 4: Industrial Growth & Infrastructure Development",
    text: "Infrastructure development forms the bedrock of national economic growth and industrial expansion. Modern road networks, high-speed freight transport corridors, expanded seaports, and automated logistics warehouses facilitate the swift movement of raw materials and finished commercial goods. State administrative departments require accurate documentation, tender preparation, and policy records to coordinate multifaceted construction undertakings. Rapid keyboard typing and precise administrative processing are indispensable for civil engineers, legal officers, and municipal executives handling governmental communications. By minimizing operational bottlenecks and digitizing bureaucratic procedures, infrastructure projects achieve timely completion and contribute substantially to employment generation and national prosperity.",
  },
  {
    id: "passage-40-3",
    wpmTarget: 40,
    title: "Passage 5: Artificial Intelligence & Workforce Evolution",
    text: "The rapid integration of artificial intelligence and machine learning algorithms across diverse industries is reshaping traditional employment paradigms and workplace dynamics. Automation handles repetitive data sorting and routine computational tasks, allowing human professionals to concentrate on strategic decision-making, creative innovation, and collaborative problem-solving. However, effective communication remains at the core of human-machine interaction. Fast and error-free typing skills remain indispensable for drafting software documentation, entering prompts, managing database queries, and exchanging executive correspondence. Professionals who continuously adapt their technical proficiencies while maintaining exceptional keyboard productivity will excel across the evolving global market.",
  },
];

const TOTAL_SECONDS = 420; // 7 Minutes

function GccTbcPage() {
  const [selectedTarget, setSelectedTarget] = useState<number>(30);
  const [passageIndex, setPassageIndex] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  const availablePassages = useMemo(() => {
    return GCC_PASSAGES.filter((p) => p.wpmTarget === selectedTarget);
  }, [selectedTarget]);

  const currentPassage = availablePassages[passageIndex] || availablePassages[0];
  const targetText = currentPassage?.text || "";

  // Reset test state
  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTypedText("");
    setSecondsLeft(TOTAL_SECONDS);
    setIsRunning(false);
    setIsFinished(false);
    setStartTime(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Switch speed mode (30 or 40 WPM)
  const handleTargetChange = (wpm: number) => {
    setSelectedTarget(wpm);
    setPassageIndex(0);
    handleReset();
  };

  // Timer loop
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            fireConfetti();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsLeft]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!isRunning && !isFinished && val.length > 0) {
      setIsRunning(true);
      setStartTime(Date.now());
    }

    setTypedText(val);

    // Auto-finish if complete passage typed
    if (val.length >= targetText.length && val.length > 50) {
      setIsRunning(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      fireConfetti();
    }
  };

  // Compute GCC-TBC specific stats
  const stats = useMemo(() => {
    const elapsedSeconds = Math.max(1, TOTAL_SECONDS - secondsLeft);
    const elapsedMinutes = elapsedSeconds / 60;

    let mistakes = 0;
    let correctChars = 0;
    const typedLen = typedText.length;

    for (let i = 0; i < typedLen; i++) {
      if (i < targetText.length && typedText[i] === targetText[i]) {
        correctChars++;
      } else {
        mistakes++;
      }
    }

    // GCC-TBC official word is 5 keystrokes
    const totalKeystrokes = typedLen;
    const grossWords = totalKeystrokes / 5;
    const grossWpm = Math.round(grossWords / elapsedMinutes);

    // Net WPM calculation with mistake penalty
    const netWords = Math.max(0, (correctChars / 5) - (mistakes * 0.5));
    const netWpm = Math.max(0, Math.round(netWords / elapsedMinutes));

    const accuracy = typedLen > 0 ? Math.max(0, Math.round((correctChars / typedLen) * 100)) : 100;

    // Passing criteria
    const isPassed = netWpm >= selectedTarget && accuracy >= 85;
    let grade = "Fail";
    if (isPassed) {
      if (netWpm >= selectedTarget + 10 && accuracy >= 95) grade = "Grade A (Distinction)";
      else if (netWpm >= selectedTarget + 5 && accuracy >= 90) grade = "Grade B (First Class)";
      else grade = "Grade C (Pass)";
    }

    return {
      totalKeystrokes,
      correctChars,
      mistakes,
      grossWpm,
      netWpm,
      accuracy,
      isPassed,
      grade,
      elapsedSeconds,
    };
  }, [typedText, targetText, secondsLeft, selectedTarget]);

  // Format timer MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          <span className="mx-1">/</span>
          <Link to="/typing-test" className="hover:text-foreground">
            Typing Tests
          </Link>{" "}
          <span className="mx-1">/</span>
          <span className="text-foreground">GCC-TBC 7-Minute Exam Practice</span>
        </nav>

        {/* Page Title & Intro */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              GCC-TBC 30 & 40 WPM English Typing Test (7 Minutes)
            </h1>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              <Sparkles className="mr-1 h-3 w-3" /> Official Format
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Official 7-minute (420 seconds) GCC-TBC Maharashtra Computer Typing examination practice.
            Test your Net WPM, keystroke accuracy, mistake deductions, and obtain your official grade scorecard.
          </p>
        </header>

        {/* Speed Target Selector & Passage Picker */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface/50 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Exam Speed:
            </span>
            <div className="inline-flex rounded-lg border border-border bg-background p-1">
              <Button
                size="sm"
                variant={selectedTarget === 30 ? "default" : "ghost"}
                onClick={() => handleTargetChange(30)}
                className="h-8 text-xs font-medium"
              >
                GCC-TBC 30 WPM (7 Min)
              </Button>
              <Button
                size="sm"
                variant={selectedTarget === 40 ? "default" : "ghost"}
                onClick={() => handleTargetChange(40)}
                className="h-8 text-xs font-medium"
              >
                GCC-TBC 40 WPM (7 Min)
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Passage:
            </span>
            {availablePassages.map((p, idx) => (
              <Button
                key={p.id}
                size="sm"
                variant={passageIndex === idx ? "secondary" : "outline"}
                onClick={() => {
                  setPassageIndex(idx);
                  handleReset();
                }}
                className="h-8 text-xs"
              >
                Passage {idx + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Test Area or Result Screen */}
        {!isFinished ? (
          <div className="space-y-6">
            {/* Live Stats Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Card className="p-3 text-center border-primary/20 bg-surface">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Time Left
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-primary">
                  {formatTime(secondsLeft)}
                </div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Target Speed</div>
                <div className="mt-1 font-mono text-2xl font-bold">{selectedTarget} WPM</div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Net WPM</div>
                <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                  {stats.netWpm}
                </div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="mt-1 font-mono text-2xl font-bold">{stats.accuracy}%</div>
              </Card>

              <Card className="p-3 text-center bg-surface col-span-2 sm:col-span-1">
                <div className="text-xs text-muted-foreground">Keystrokes</div>
                <div className="mt-1 font-mono text-2xl font-bold">{stats.totalKeystrokes}</div>
              </Card>
            </div>

            {/* Passage Reference Box */}
            <Card className="p-5 border-border bg-surface/70 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" /> {currentPassage.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {targetText.split(" ").length} Words · {targetText.length} Characters
                </span>
              </div>
              <div className="rounded-lg bg-background/90 p-4 font-mono text-sm leading-relaxed tracking-wide text-foreground/90 select-none max-h-48 overflow-y-auto border border-border/50">
                {targetText}
              </div>
            </Card>

            {/* Candidate Typing Input Box */}
            <Card className="p-5 border-primary/30 bg-surface shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="gcc-typing-input"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Candidate Typing Area (Start typing to begin 7-minute timer):
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-1 h-3 w-3" /> Reset
                </Button>
              </div>
              <textarea
                id="gcc-typing-input"
                ref={inputRef}
                value={typedText}
                onChange={handleInputChange}
                disabled={isFinished}
                placeholder="Click here and begin typing the above official passage. Timer will start automatically..."
                rows={7}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="w-full resize-y rounded-lg border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Typed: {typedText.length} / {targetText.length} characters
                </span>
                <span>
                  Mistakes: <span className="font-semibold text-rose-400">{stats.mistakes}</span>
                </span>
              </div>
            </Card>
          </div>
        ) : (
          /* Official Scorecard / Result */
          <Card className="p-6 md:p-8 border-primary/40 bg-surface shadow-glow max-w-3xl mx-auto">
            <div className="text-center pb-6 border-b border-border">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                {stats.isPassed ? (
                  <Trophy className="h-7 w-7 text-amber-400" />
                ) : (
                  <XCircle className="h-7 w-7 text-rose-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">GCC-TBC Official Result Scorecard</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Exam Speed: {selectedTarget} WPM | Duration: 7 Minutes (420 Seconds)
              </p>
              <div className="mt-3">
                <Badge
                  className={`px-4 py-1 text-sm font-semibold ${
                    stats.isPassed
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {stats.isPassed ? "RESULT: PASSED" : "RESULT: FAILED (Speed or Accuracy below criteria)"}
                </Badge>
              </div>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-border text-center">
              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-xs text-muted-foreground">Net Speed</div>
                <div className="text-2xl font-bold font-mono text-primary mt-1">
                  {stats.netWpm} <span className="text-xs font-normal">WPM</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-xs text-muted-foreground">Gross Speed</div>
                <div className="text-2xl font-bold font-mono mt-1">
                  {stats.grossWpm} <span className="text-xs font-normal">WPM</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="text-2xl font-bold font-mono mt-1">
                  {stats.accuracy}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-xs text-muted-foreground">Mistakes</div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {stats.mistakes}
                </div>
              </div>
            </div>

            {/* Grade Award */}
            <div className="py-4 text-center">
              <div className="text-xs text-muted-foreground">Assigned Examination Grade:</div>
              <div className="text-xl font-bold text-foreground mt-1">{stats.grade}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total Keystrokes: {stats.totalKeystrokes} | Correct Characters: {stats.correctChars} | Time Taken: {formatTime(stats.elapsedSeconds)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 pt-4 border-t border-border">
              <Button onClick={handleReset} className="bg-primary text-primary-foreground">
                <RotateCcw className="mr-2 h-4 w-4" /> Practice Again
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPassageIndex((prev) => (prev + 1) % availablePassages.length);
                  handleReset();
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> Next Passage
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print Scorecard
              </Button>
            </div>
          </Card>
        )}

        {/* Informational SEO & Exam Guide Section */}
        <section className="mt-16 space-y-8">
          <div>
            <h2 className="text-xl font-bold md:text-2xl flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" /> About GCC-TBC 30 & 40 WPM English Typing Exam
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              The <strong>Government Certificate in Computer Typing Basic Course (GCC-TBC)</strong> is conducted by state examination councils (such as MSCEIA Pune in Maharashtra) to certify professional typing competency. Government clerk, steno, and administrative job eligibility strictly requires candidates to possess a valid GCC-TBC 30 WPM or 40 WPM certification.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-5 border-border bg-surface/40">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> GCC-TBC 30 WPM Format (7 Min)
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
                <li>• <strong>Duration:</strong> Exactly 7 minutes (420 seconds).</li>
                <li>• <strong>Target Words:</strong> 210 Words (1,050 Keystrokes).</li>
                <li>• <strong>Passing Net Speed:</strong> Minimum 30 Net WPM.</li>
                <li>• <strong>Accuracy Requirement:</strong> 90% and above for Grade A/B.</li>
                <li>• <strong>Passage Type:</strong> Administrative notices, general essays, and formal statements.</li>
              </ul>
            </Card>

            <Card className="p-5 border-border bg-surface/40">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" /> GCC-TBC 40 WPM Format (7 Min)
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
                <li>• <strong>Duration:</strong> Exactly 7 minutes (420 seconds).</li>
                <li>• <strong>Target Words:</strong> 280 Words (1,400 Keystrokes).</li>
                <li>• <strong>Passing Net Speed:</strong> Minimum 40 Net WPM.</li>
                <li>• <strong>Accuracy Requirement:</strong> 90% and above for Grade A/B.</li>
                <li>• <strong>Passage Type:</strong> Complex technical reports, financial statements, and business letters.</li>
              </ul>
            </Card>
          </div>

          {/* GCC-TBC FAQs */}
          <div className="pt-4">
            <h2 className="text-xl font-bold md:text-2xl flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions (GCC-TBC 7-Min Exam)
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="faq-1" className="rounded-lg border border-border bg-surface/30 px-4">
                <AccordionTrigger className="text-sm font-medium">
                  What is the penalty for mistakes in the 7-minute GCC-TBC exam?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  In GCC-TBC evaluations, each spelling mistake, omitted word, or punctuation error results in a deduction from your gross keystroke count. Net WPM is calculated after deducting error penalties. Maintaining 95%+ accuracy is crucial to avoid failing due to penalties.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="rounded-lg border border-border bg-surface/30 px-4">
                <AccordionTrigger className="text-sm font-medium">
                  Can I use backspace during the GCC-TBC exam?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  In modern online GCC-TBC computer typing tests, standard backspace correction is permitted while typing the active word, but overusing backspace costs valuable seconds. It is recommended to practice touch typing so you type accurately on the first pass.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="rounded-lg border border-border bg-surface/30 px-4">
                <AccordionTrigger className="text-sm font-medium">
                  How many words are there in a standard 7-minute passage?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  A 30 WPM passage typically contains around 210 to 250 words (1,050 to 1,250 characters). A 40 WPM passage contains around 280 to 320 words (1,400 to 1,600 characters).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
    </div>
  );
}
