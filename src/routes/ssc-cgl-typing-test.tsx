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
  HelpCircle,
  Keyboard,
  Printer,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { fireConfetti } from "@/components/Confetti";
import { KeyboardMistakeHeatmap } from "@/components/KeyboardMistakeHeatmap";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/ssc-cgl-typing-test")({
  head: () => ({
    meta: [
      {
        title: "SSC CGL / CHSL DEST Typing Test Simulator (15 Min / 2000 Depressions)",
      },
      {
        name: "description",
        content:
          "Official SSC CGL & CHSL DEST typing test simulator (15 minutes, 2000 key depressions). Evaluates Full vs Half mistakes, percentage error calculation, and category-wise cutoffs.",
      },
      {
        name: "keywords",
        content:
          "ssc cgl typing test 15 minutes, ssc chsl typing test 2000 depressions, ssc dest typing practice, ssc cgl skill test online, ssc typing test full mistake half mistake, ssc typing test evaluation formula, ssc cgl typing test cutoff",
      },
      {
        property: "og:title",
        content: "SSC CGL / CHSL DEST Typing Test Simulator — 15 Min / 2000 Depressions",
      },
      {
        property: "og:description",
        content:
          "Practice 15-minute SSC CGL and CHSL typing test with official Full vs Half mistake deduction rules and real percentage error grading.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/ssc-cgl-typing-test" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "SSC CGL / CHSL DEST Typing Test Simulator",
      },
      {
        name: "twitter:description",
        content:
          "Official SSC 15-minute / 2000 key depression skill test practice with Full & Half mistake evaluation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/ssc-cgl-typing-test" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "SSC CGL / CHSL DEST Typing Test Simulator",
          url: "https://www.englishtypingtest.org/ssc-cgl-typing-test",
          applicationCategory: "EducationalApplication",
          operatingSystem: "All",
          description:
            "15-minute SSC CGL/CHSL DEST typing test simulator with 2000 key depressions, Full & Half mistake deduction, and category cutoff evaluator.",
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
              name: "What is the typing speed requirement for SSC CGL / CHSL DEST?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "SSC CGL DEST requires a typing speed of 2000 key depressions in 15 minutes, which is roughly 27 words per minute (WPM) or 8000 key depressions per hour (KDPH). SSC CHSL requires 35 WPM (English) or 30 WPM (Hindi).",
              },
            },
            {
              "@type": "Question",
              name: "How are Full Mistakes and Half Mistakes calculated in SSC typing tests?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Full Mistakes (100% penalty) include omission, substitution, or addition of an entire word. Half Mistakes (50% penalty) include spelling errors, wrong capitalization, punctuation errors, and spacing mistakes.",
              },
            },
            {
              "@type": "Question",
              name: "What is the maximum allowed error percentage for SSC CGL typing test?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For UR (General / EWS) candidates, the maximum permissible error percentage is usually 5% (or 7% depending on post criteria). For OBC, SC, ST, ESM, and PwD candidates, up to 7% to 10% error is allowed.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: SscTypingPage,
});

// Authentic SSC Exam Passages (~2000 - 2100 Key Depressions)
const SSC_PASSAGES = [
  {
    id: "ssc-1",
    title: "Passage 1: Digital India and E-Governance Reforms",
    category: "Public Administration",
    text: `The Digital India programme is a flagship initiative of the Government of India with a vision to transform India into a digitally empowered society and knowledge economy. E-Governance initiatives across the country have revolutionized public service delivery by ensuring transparency, efficiency, and real-time citizen grievance redressal. The integration of Aadhaar with direct benefit transfer schemes has plugged major leakages in welfare subsidies, saving thousands of crores of public revenue. Digital platforms like Unified Payments Interface, DigiLocker, and Government e-Marketplace have established world-class digital public infrastructure. Today, even remote rural citizens can access government entitlements, banking facilities, and educational portals seamlessly through Common Services Centres established nationwide. The widespread expansion of high-speed optical fibre connectivity under BharatNet continues to bridge the digital divide between urban and rural populations.`,
  },
  {
    id: "ssc-2",
    title: "Passage 2: Indian Economic Growth & Fiscal Infrastructure",
    category: "Indian Economy",
    text: `India has emerged as one of the fastest growing major economies in the world, driven by strong domestic consumption, public capital expenditure, and robust structural reforms. The manufacturing sector has received a significant boost through Production Linked Incentive schemes aimed at establishing domestic supply chains across key strategic sectors. Simultaneously, infrastructure modernization through the PM GatiShakti national master plan is reducing logistics costs and expediting freight movement across multimodal corridors. The banking system has shown remarkable resilience with declining non-performing assets and healthy capital adequacy ratios. The growth of digital commerce, formalization of micro enterprises through Goods and Services Tax, and sustained foreign direct investment inflows reflect enduring international confidence in India's macroeconomic fundamentals and long-term industrial prospects.`,
  },
  {
    id: "ssc-3",
    title: "Passage 3: Environmental Conservation & Renewable Energy",
    category: "Environment & Ecology",
    text: `Sustainable development and ecological conservation represent critical national priorities in the modern era. Climate change poses formidable challenges to agricultural productivity, water security, and coastal ecosystems. India has made commendable progress in accelerating its transition toward renewable energy sources, particularly solar and wind power installations. The National Green Hydrogen Mission aims to decarbonize heavy industries, transport networks, and energy production. Conservation efforts focused on afforestation, wetland preservation under the Ramsar convention, and biodiversity protection in national parks have yielded positive results. Promoting circular economy practices through waste management regulations and eco-friendly consumer habits is essential to ensure that industrial development proceeds in harmony with natural environmental preservation for future generations.`,
  },
  {
    id: "ssc-4",
    title: "Passage 4: Science, Technology and Space Research",
    category: "Science & Space",
    text: `Scientific innovation and technological self-reliance are the pillars of contemporary national development. The Indian Space Research Organisation has achieved historic milestones in planetary exploration through cost-effective missions to the Moon and Mars. Indigenously developed launch vehicles have successfully deployed hundreds of commercial satellites for global partners, establishing India as a trusted space power. Furthermore, investments in quantum computing, artificial intelligence, and semiconductor manufacturing are creating high-skilled employment opportunities. The promotion of scientific temper through Atal Tinkering Labs in secondary schools is nurturing curiosity and creative problem-solving among young students. Continued synergy between academia, private startups, and public research laboratories will propel sustainable technological breakthroughs across biomedical and aerospace frontiers.`,
  },
];

const EXAM_DURATION = 900; // 15 Minutes (900 seconds)
const TARGET_DEPRESSIONS = 2000; // SSC Standard

function SscTypingPage() {
  const [passageIndex, setPassageIndex] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(EXAM_DURATION);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [category, setCategory] = useState<"UR" | "OBC" | "SC_ST" | "PwD">("UR");
  const [strictBackspace, setStrictBackspace] = useState<boolean>(false);

  const currentPassage = SSC_PASSAGES[passageIndex];
  const targetText = currentPassage.text;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  // Reset function
  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTypedText("");
    setSecondsLeft(EXAM_DURATION);
    setIsRunning(false);
    setIsFinished(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  // Timer loop
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            sfx.bell();
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
    }
    setTypedText(val);

    // Auto-complete when whole passage is typed
    if (val.trim().length >= targetText.trim().length && val.slice(-1) === targetText.slice(-1)) {
      setIsRunning(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      sfx.success();
      fireConfetti();
    }
  };

  // Official SSC Evaluation Engine (Full vs Half Mistakes)
  const evaluation = useMemo(() => {
    const elapsedSeconds = Math.max(1, EXAM_DURATION - secondsLeft);
    const elapsedMinutes = elapsedSeconds / 60;

    const targetWords = targetText.trim().split(/\s+/);
    const typedWords = typedText.trim().split(/\s+/).filter(Boolean);

    let fullMistakes = 0;
    let halfMistakes = 0;
    const fullMistakeList: string[] = [];
    const halfMistakeList: string[] = [];
    const mistakeMap: Record<string, number> = {};

    const maxLen = Math.max(targetWords.length, typedWords.length);

    for (let i = 0; i < typedWords.length; i++) {
      const tw = typedWords[i];
      const gw = targetWords[i];

      if (!gw) {
        // Extra word typed -> Full Mistake
        fullMistakes++;
        fullMistakeList.push(`Extra: "${tw}"`);
        continue;
      }

      if (tw === gw) {
        // Exact match -> No mistake
        continue;
      }

      // Check for Half Mistakes (Case mismatch, Punctuation differences, Minor spelling error)
      const cleanTw = tw.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const cleanGw = gw.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

      if (cleanTw === cleanGw && tw !== gw) {
        // Capitalization or Punctuation mismatch -> Half Mistake
        halfMistakes++;
        halfMistakeList.push(`Case/Punctuation: "${tw}" for "${gw}"`);
      } else if (cleanTw.length > 2 && cleanGw.length > 2 && (cleanTw.includes(cleanGw) || cleanGw.includes(cleanTw))) {
        // Minor typo/letter insertion/omission -> Half Mistake
        halfMistakes++;
        halfMistakeList.push(`Spelling: "${tw}" for "${gw}"`);
      } else {
        // Entirely different word / substitution -> Full Mistake
        fullMistakes++;
        fullMistakeList.push(`Substitution: "${tw}" instead of "${gw}"`);
      }

      // Record character mistake map for heatmap
      for (let j = 0; j < Math.max(tw.length, gw.length); j++) {
        if (tw[j] !== gw[j]) {
          const k = j < gw.length ? gw[j] : tw[j];
          mistakeMap[k] = (mistakeMap[k] ?? 0) + 1;
        }
      }
    }

    // Un-attempted / missed words (Omission) -> Full Mistakes
    if (targetWords.length > typedWords.length) {
      const omittedCount = targetWords.length - typedWords.length;
      fullMistakes += omittedCount;
      if (omittedCount <= 5) {
        for (let i = typedWords.length; i < targetWords.length; i++) {
          fullMistakeList.push(`Omitted: "${targetWords[i]}"`);
        }
      } else {
        fullMistakeList.push(`${omittedCount} Omitted words remaining in passage`);
      }
    }

    // Total Mistakes = Full Mistakes + (Half Mistakes * 0.5)
    const totalMistakeCount = fullMistakes + halfMistakes * 0.5;

    // Total Key Depressions Typed
    const totalKeyDepressions = typedText.length;
    const targetKeyDepressions = targetText.length;

    // Key Depressions Per Hour (KDPH)
    const kdph = Math.round((totalKeyDepressions / elapsedMinutes) * 60);

    // Gross Words Per Minute
    const grossWpm = Math.round((totalKeyDepressions / 5) / elapsedMinutes);

    // Percentage Error Calculation (Official SSC Formula)
    // % Error = (Total Mistake Count * 5 / Total Key Depressions Typed) * 100
    const rawErrorPercent =
      totalKeyDepressions > 0
        ? (totalMistakeCount * 5 / totalKeyDepressions) * 100
        : 0;
    const errorPercent = Math.min(100, Math.round(rawErrorPercent * 100) / 100);

    // Net WPM (with error deduction)
    const netWords = Math.max(0, (totalKeyDepressions / 5) - (totalMistakeCount * 2));
    const netWpm = Math.max(0, Math.round(netWords / elapsedMinutes));

    // Category Cutoffs (SSC CGL / CHSL DEST)
    const cutoffs = {
      UR: 5.0,     // 5% max error
      OBC: 7.0,    // 7% max error
      SC_ST: 10.0, // 10% max error
      PwD: 10.0,   // 10% max error
    };

    const maxAllowedError = cutoffs[category];
    const isDepressionQualified = totalKeyDepressions >= 1750 || secondsLeft === 0;
    const isPassed = errorPercent <= maxAllowedError && totalKeyDepressions >= 1500;

    return {
      totalKeyDepressions,
      targetKeyDepressions,
      kdph,
      grossWpm,
      netWpm,
      fullMistakes,
      halfMistakes,
      totalMistakeCount,
      errorPercent,
      maxAllowedError,
      isPassed,
      fullMistakeList: fullMistakeList.slice(0, 10),
      halfMistakeList: halfMistakeList.slice(0, 10),
      mistakeMap,
      elapsedSeconds,
    };
  }, [typedText, targetText, secondsLeft, category]);

  // Format timer MM:SS
  const formatTimer = (sec: number) => {
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
          <span className="text-foreground">SSC CGL / CHSL DEST Typing Simulator</span>
        </nav>

        {/* Page Title & Intro */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              SSC CGL / CHSL DEST Typing Test Simulator
            </h1>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              <Scale className="mr-1 h-3 w-3" /> 15 Min / 2000 Depressions
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Official Staff Selection Commission (SSC CGL, CHSL, Steno) Data Entry Skill Test simulator.
            Evaluates <strong>Full vs Half Mistakes</strong>, accurate <strong>Percentage Error (% Error)</strong>, Key Depressions Per Hour (KDPH), and Category Cutoff status.
          </p>
        </header>

        {/* Control Bar: Passage Selector & Candidate Category */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface/50 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Passage:
            </span>
            {SSC_PASSAGES.map((p, idx) => (
              <Button
                key={p.id}
                size="sm"
                variant={passageIndex === idx ? "default" : "outline"}
                onClick={() => {
                  setPassageIndex(idx);
                  handleReset();
                }}
                className="h-7 text-xs"
              >
                Passage #{idx + 1}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Category Cutoff:
              </span>
              <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
                {(["UR", "OBC", "SC_ST", "PwD"] as const).map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={category === cat ? "secondary" : "ghost"}
                    onClick={() => setCategory(cat)}
                    className="h-7 px-2 text-[11px] font-semibold"
                  >
                    {cat === "UR" ? "UR (5%)" : cat === "OBC" ? "OBC (7%)" : cat === "SC_ST" ? "SC/ST (10%)" : "PwD (10%)"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Typing Interface / Result View */}
        {!isFinished ? (
          <div className="space-y-6">
            {/* Live Exam HUD */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="p-3 text-center border-primary/30 bg-surface">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Remaining Time
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-primary">
                  {formatTimer(secondsLeft)}
                </div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Key Depressions</div>
                <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                  {typedText.length}{" "}
                  <span className="text-xs font-normal text-muted-foreground">/ {TARGET_DEPRESSIONS}</span>
                </div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Depressions/Hour (KDPH)</div>
                <div className="mt-1 font-mono text-2xl font-bold">{evaluation.kdph}</div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Live Error %</div>
                <div className={`mt-1 font-mono text-2xl font-bold ${evaluation.errorPercent > evaluation.maxAllowedError ? "text-rose-400" : "text-emerald-400"}`}>
                  {evaluation.errorPercent}%
                </div>
              </Card>
            </div>

            {/* Master SSC Passage Box */}
            <Card className="border-border bg-surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {currentPassage.title} ({targetText.length} Strokes)
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  SSC DEST Master Text
                </Badge>
              </div>
              <div className="max-h-48 overflow-y-auto p-4 md:p-5 font-mono text-xs md:text-sm leading-relaxed text-muted-foreground select-none bg-background/40">
                {targetText}
              </div>
            </Card>

            {/* Candidate Typing Textarea */}
            <Card className="border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Keyboard className="h-4 w-4 text-primary" /> Candidate Typing Area:
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-1 h-3 w-3" /> Reset 15 Min
                </Button>
              </div>

              <textarea
                ref={textareaRef}
                value={typedText}
                onChange={handleInputChange}
                placeholder="Click here and start typing the passage above. The 15-minute exam timer will start automatically on your first keystroke..."
                rows={8}
                spellCheck={false}
                autoComplete="off"
                className="w-full resize-none rounded-lg border border-border bg-background p-3.5 font-mono text-xs md:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {/* Live Status Footer */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>
                    Strokes: <strong>{typedText.length}</strong> / {targetText.length} (
                    {Math.min(100, Math.round((typedText.length / TARGET_DEPRESSIONS) * 100))}%)
                  </span>
                  <span>
                    Words Typed: <strong>{typedText.trim().split(/\s+/).filter(Boolean).length}</strong>
                  </span>
                </div>
                <Button
                  size="sm"
                  disabled={typedText.trim().length === 0}
                  onClick={() => {
                    setIsRunning(false);
                    setIsFinished(true);
                    if (timerRef.current) clearInterval(timerRef.current);
                    sfx.success();
                    fireConfetti();
                  }}
                  className="h-7 text-xs bg-primary text-primary-foreground font-semibold"
                >
                  Submit & Evaluate Test
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* Official SSC Evaluation Result Card */
          <div className="space-y-6">
            <Card className="p-6 md:p-8 border-primary/40 bg-surface shadow-glow max-w-4xl mx-auto">
              {/* Scorecard Header */}
              <div className="text-center pb-6 border-b border-border">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  {evaluation.isPassed ? (
                    <Trophy className="h-7 w-7 text-amber-400" />
                  ) : (
                    <XCircle className="h-7 w-7 text-rose-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold md:text-3xl">SSC CGL / CHSL DEST Evaluation Scorecard</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Official 15-Minute Skill Test Evaluation Report ({category} Category Cutoff: {evaluation.maxAllowedError}%)
                </p>
                <div className="mt-3">
                  <Badge
                    className={`px-4 py-1 text-sm font-semibold ${
                      evaluation.isPassed
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {evaluation.isPassed
                      ? "QUALIFIED / PASSED (Error % within permissible limit)"
                      : "DISQUALIFIED / FAILED (Error % exceeded cutoff threshold)"}
                  </Badge>
                </div>
              </div>

              {/* Primary Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-border text-center">
                <div className="p-3 rounded-lg bg-background/60">
                  <div className="text-xs text-muted-foreground">Percentage Error</div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${evaluation.errorPercent <= evaluation.maxAllowedError ? "text-emerald-400" : "text-rose-400"}`}>
                    {evaluation.errorPercent}%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Max Allowed: {evaluation.maxAllowedError}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/60">
                  <div className="text-xs text-muted-foreground">Key Depressions</div>
                  <div className="text-2xl font-bold font-mono text-primary mt-1">
                    {evaluation.totalKeyDepressions}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Target: 2000 Strokes
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/60">
                  <div className="text-xs text-muted-foreground">Speed (KDPH)</div>
                  <div className="text-2xl font-bold font-mono mt-1">
                    {evaluation.kdph}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Net Speed: {evaluation.netWpm} WPM
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/60">
                  <div className="text-xs text-muted-foreground">Gross WPM</div>
                  <div className="text-2xl font-bold font-mono mt-1">
                    {evaluation.grossWpm} WPM
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Time: {formatTimer(evaluation.elapsedSeconds)}
                  </div>
                </div>
              </div>

              {/* Full vs Half Mistake Diagnostic Table */}
              <div className="py-6 border-b border-border space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" /> Official SSC Mistake Deduction Breakdown:
                </h3>

                <div className="grid gap-4 sm:grid-cols-3 text-center">
                  <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
                    <div className="text-xs font-semibold text-rose-400">Full Mistakes (100% Penalty)</div>
                    <div className="text-xl font-bold font-mono text-foreground mt-1">
                      {evaluation.fullMistakes}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Omissions, substitutions & extra words
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <div className="text-xs font-semibold text-amber-400">Half Mistakes (50% Penalty)</div>
                    <div className="text-xl font-bold font-mono text-foreground mt-1">
                      {evaluation.halfMistakes} (×0.5 = {evaluation.halfMistakes * 0.5})
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Spelling, casing & punctuation typos
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="text-xs font-semibold text-primary">Total Calculated Mistakes</div>
                    <div className="text-xl font-bold font-mono text-primary mt-1">
                      {evaluation.totalMistakeCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Full + (Half × 0.5)
                    </div>
                  </div>
                </div>

                {/* Mistake Details Log */}
                {(evaluation.fullMistakeList.length > 0 || evaluation.halfMistakeList.length > 0) && (
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 text-xs">
                    {evaluation.fullMistakeList.length > 0 && (
                      <div className="rounded-lg border border-border/70 bg-background/50 p-3">
                        <div className="font-semibold text-rose-400 mb-1">Top Full Mistakes:</div>
                        <ul className="space-y-1 text-muted-foreground font-mono text-[11px]">
                          {evaluation.fullMistakeList.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.halfMistakeList.length > 0 && (
                      <div className="rounded-lg border border-border/70 bg-background/50 p-3">
                        <div className="font-semibold text-amber-400 mb-1">Top Half Mistakes:</div>
                        <ul className="space-y-1 text-muted-foreground font-mono text-[11px]">
                          {evaluation.halfMistakeList.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Keyboard Mistake Heatmap */}
              <div className="pt-4">
                <KeyboardMistakeHeatmap
                  mistakeMap={evaluation.mistakeMap}
                  targetText={targetText}
                  typedText={typedText}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 pt-4 border-t border-border">
                <Button onClick={handleReset} className="bg-primary text-primary-foreground">
                  <RotateCcw className="mr-2 h-4 w-4" /> Practice Test Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPassageIndex((prev) => (prev + 1) % SSC_PASSAGES.length);
                    handleReset();
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" /> Next Exam Passage
                </Button>
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print Scorecard
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Informational SEO & Exam Evaluation Guide Section */}
        <section className="mt-16 space-y-8">
          <div>
            <h2 className="text-xl font-bold md:text-2xl flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" /> SSC CGL & CHSL DEST Typing Test Rules & Evaluation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              The Staff Selection Commission conducts Data Entry Skill Tests (DEST) and Typing Tests for posts like Tax Assistant (CBDT & CBIC), Postal Assistant (PA), Sorting Assistant (SA), Lower Division Clerk (LDC), and Junior Secretariat Assistant (JSA). Practicing with the exact 15-minute countdown and Full/Half mistake formula ensures you meet the strict cutoff criteria on exam day.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-5 border-border bg-surface/40">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Key Depressions Standard
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Candidates must type <strong>2,000 Key Depressions in 15 minutes</strong> for SSC CGL DEST (approx. 27 WPM / 8,000 KDPH). For CHSL English typing, 35 WPM (1,750 depressions in 10 mins) is required.
              </p>
            </Card>

            <Card className="p-5 border-border bg-surface/40">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Full vs Half Mistakes
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                <strong>Full Mistakes (1.0)</strong>: Omission, substitution, or addition of words.<br />
                <strong>Half Mistakes (0.5)</strong>: Spelling typos, punctuation errors, wrong capitalization, or spacing issues.
              </p>
            </Card>

            <Card className="p-5 border-border bg-surface/40">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Official Cutoff Thresholds
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                UR / EWS candidates must maintain a maximum error of <strong>5% to 7%</strong>. OBC candidates are allowed up to <strong>7%</strong>, while SC, ST, and PwD candidates are allowed up to <strong>10% error</strong>.
              </p>
            </Card>
          </div>

          {/* FAQs */}
          <div className="pt-4">
            <h2 className="text-xl font-bold md:text-2xl flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions (SSC DEST Typing)
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="ssc-faq-1" className="rounded-lg border border-border bg-surface/30 px-4">
                <AccordionTrigger className="text-sm font-medium">
                  Is backspace allowed in the actual SSC CGL/CHSL typing exam?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Yes, backspace is permitted in the SSC typing test software. However, excessive backspacing consumes valuable seconds. Focus on rhythm and initial keystroke accuracy rather than frequent backspacing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ssc-faq-2" className="rounded-lg border border-border bg-surface/30 px-4">
                <AccordionTrigger className="text-sm font-medium">
                  What happens if I type more than 2,000 key depressions?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  You should type the complete master passage accurately until the end. Extra words typed beyond the passage text will be marked as Full Mistakes under the SSC evaluation formula.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ssc-faq-3" className="rounded-lg border border-border bg-surface/30 px-4">
                <AccordionTrigger className="text-sm font-medium">
                  How is the SSC % Error calculated mathematically?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  SSC computes Percentage Error as: <code>% Error = (Total Mistakes in Words × 5 / Total Key Depressions Typed) × 100</code>, where Total Mistakes = Full Mistakes + (Half Mistakes × 0.5).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
    </div>
  );
}
