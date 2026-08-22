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
  Bot,
  CheckCircle2,
  Clock,
  Headphones,
  HelpCircle,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { fireConfetti } from "@/components/Confetti";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/live-chat-typing-test")({
  head: () => ({
    meta: [
      {
        title: "Live Chat Typing Test 60s — Customer Support Practice",
      },
      {
        name: "description",
        content:
          "Practice the free 60-second Live Chat Typing Test simulation. Measure live response WPM, accuracy, customer support readiness, and SLA grade online.",
      },
      {
        name: "keywords",
        content:
          "live chat typing test 60 seconds, typing chat live 60 seconds, live chat typing test 60 second online, typing test 60 seconds live chat, customer service typing test, chat agent typing test, live chat wpm test",
      },
      {
        property: "og:title",
        content: "Live Chat Typing Test 60s — Customer Support Assessment",
      },
      {
        property: "og:description",
        content:
          "Interactive customer support chat simulation. Test your 60-second typing speed, response accuracy, and agent readiness grade.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/live-chat-typing-test" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Live Chat Typing Test 60s — Customer Support Assessment",
      },
      {
        name: "twitter:description",
        content:
          "Interactive live chat typing simulator for BPO, KPO, Amazon, and customer support job assessments.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/live-chat-typing-test" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Live Chat 60-Second Typing Test Simulator",
          url: "https://www.englishtypingtest.org/live-chat-typing-test",
          applicationCategory: "EducationalApplication",
          operatingSystem: "All",
          description:
            "60-second live chat customer support typing assessment simulator measuring Net WPM and accuracy.",
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
              name: "What is a good typing speed for a Live Chat Customer Support job?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Most top customer support employers (like Amazon, Apple, Zendesk, Concentrix) require a minimum typing speed of 45 to 60 Net WPM with at least 95% accuracy. Elite live chat specialists type between 65 to 80+ WPM to handle multiple concurrent chats.",
              },
            },
            {
              "@type": "Question",
              name: "How does the 60-Second Live Chat Typing Test work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The test presents realistic customer inquiries in a simulated chat interface. You type the accurate support response before the 60-second timer expires. The system tracks your Net WPM, accuracy %, mistakes, and response SLA.",
              },
            },
            {
              "@type": "Question",
              name: "Why is live chat typing different from standard typing tests?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Live chat requires conversational punctuation, empathy greetings, numerical order IDs, and proper grammar under tight response time constraints, whereas standard tests often use generic word lists.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: LiveChatPage,
});

// Realistic Customer Inquiries & Ideal Agent Responses
const CHAT_SCENARIOS = [
  {
    id: "chat-1",
    customerName: "Sarah Jenkins",
    customerAvatar: "👩",
    inquiry:
      "Hello! I ordered order #84920 yesterday morning with express shipping, but I haven't received a tracking update yet. Can you please check when it will be delivered?",
    expectedResponse:
      "Hello Sarah, thank you for reaching out to support today! I would be glad to assist you with order #84920. Let me check the shipping records in our fulfillment database right now.",
    category: "Order Tracking & Shipping",
  },
  {
    id: "chat-2",
    customerName: "Michael Chang",
    customerAvatar: "👨",
    inquiry:
      "Hi support, my subscription was auto-renewed this morning for $49.00, but I had requested cancellation last week. Can you please process a full refund to my original card?",
    expectedResponse:
      "Hi Michael, I completely understand your concern regarding the $49.00 charge. I have verified your previous cancellation request and initiated a full refund to your card.",
    category: "Billing & Refund Request",
  },
  {
    id: "chat-3",
    customerName: "Emily Davis",
    customerAvatar: "👩‍💼",
    inquiry:
      "Good afternoon. I am having trouble resetting my account password. The verification code SMS is not arriving on my registered mobile number. What should I do?",
    expectedResponse:
      "Good afternoon Emily. I apologize for the inconvenience with the SMS verification code. I have sent an alternate one-time security link to your registered email address.",
    category: "Account Security & Login",
  },
  {
    id: "chat-4",
    customerName: "David Miller",
    customerAvatar: "👨‍💻",
    inquiry:
      "Hey team! The web dashboard is showing Error Code 502 Bad Gateway whenever I try to export monthly analytics to CSV. Is there an active server outage currently?",
    expectedResponse:
      "Hello David, thank you for alerting us! Our engineering team is currently aware of the CSV export gateway issue and deploying an emergency hotfix within the next ten minutes.",
    category: "Technical Troubleshooting",
  },
  {
    id: "chat-5",
    customerName: "Priya Sharma",
    customerAvatar: "👩‍🔬",
    inquiry:
      "Hi, I want to upgrade our corporate team plan from 10 seats to 25 seats starting next month. Can you share the discounted enterprise pricing structure?",
    expectedResponse:
      "Hi Priya, thank you for choosing our platform for your expanding team! Our 25-seat enterprise plan includes advanced security features and a 20% annual discount applied automatically.",
    category: "Sales & Plan Upgrade",
  },
];

const TIME_LIMIT = 60; // 60 Seconds

function LiveChatPage() {
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(TIME_LIMIT);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentScenario = CHAT_SCENARIOS[scenarioIdx];
  const targetText = currentScenario.expectedResponse;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  // Reset function
  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTypedText("");
    setSecondsLeft(TIME_LIMIT);
    setIsRunning(false);
    setIsFinished(false);
    setTimeout(() => {
      inputRef.current?.focus();
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

  // Handle live chat response input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!isRunning && !isFinished && val.length > 0) {
      setIsRunning(true);
    }

    setTypedText(val);

    // Auto-complete if message typed accurately
    if (val.trim() === targetText.trim()) {
      setIsRunning(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      sfx.success();
      fireConfetti();
    }
  };

  // Compute live chat statistics
  const stats = useMemo(() => {
    const elapsedSeconds = Math.max(1, TIME_LIMIT - secondsLeft);
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

    const netWords = Math.max(0, (correctChars / 5) - (mistakes * 0.5));
    const netWpm = Math.max(0, Math.round(netWords / elapsedMinutes));
    const accuracy = typedLen > 0 ? Math.max(0, Math.round((correctChars / typedLen) * 100)) : 100;
    const isCompleted = typedText.trim() === targetText.trim() || typedLen >= targetText.length * 0.9;

    // Agent Rating
    let agentTier = "Support Trainee (<35 WPM)";
    let tierColor = "text-amber-400";
    if (netWpm >= 70 && accuracy >= 95) {
      agentTier = "Tier 3 Senior Support Specialist (70+ WPM)";
      tierColor = "text-purple-400";
    } else if (netWpm >= 50 && accuracy >= 92) {
      agentTier = "Tier 2 Qualified Live Chat Agent (50-69 WPM)";
      tierColor = "text-emerald-400";
    } else if (netWpm >= 35 && accuracy >= 88) {
      agentTier = "Tier 1 Customer Service Associate (35-49 WPM)";
      tierColor = "text-sky-400";
    }

    return {
      netWpm,
      accuracy,
      mistakes,
      typedChars: typedLen,
      isCompleted,
      agentTier,
      tierColor,
      elapsedSeconds,
    };
  }, [typedText, targetText, secondsLeft]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          <span className="mx-1">/</span>
          <Link to="/typing-test" className="hover:text-foreground">
            Typing Tests
          </Link>{" "}
          <span className="mx-1">/</span>
          <span className="text-foreground">Live Chat Typing Test (60 Seconds)</span>
        </nav>

        {/* Header Title */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              Live Chat Typing Test (60 Seconds)
            </h1>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <Headphones className="mr-1 h-3 w-3" /> Job Assessment Simulator
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Simulate a real customer support live chat ticketing queue. Type professional agent responses within 60 seconds to evaluate your customer service speed, keystroke precision, and readiness grade.
          </p>
        </header>

        {/* Scenario Switcher Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Customer Ticket:
            </span>
            <span className="text-xs font-medium text-primary">
              Scenario {scenarioIdx + 1} of {CHAT_SCENARIOS.length} ({currentScenario.category})
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CHAT_SCENARIOS.map((s, idx) => (
              <Button
                key={s.id}
                size="sm"
                variant={scenarioIdx === idx ? "default" : "outline"}
                onClick={() => {
                  setScenarioIdx(idx);
                  handleReset();
                }}
                className="h-7 text-xs"
              >
                Ticket #{idx + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Live Chat Window */}
        {!isFinished ? (
          <div className="space-y-6">
            {/* Live Performance HUD */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="p-3 text-center border-primary/20 bg-surface">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Response Time
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-primary">
                  {secondsLeft}s
                </div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Live Chat WPM</div>
                <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                  {stats.netWpm}
                </div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="mt-1 font-mono text-2xl font-bold">{stats.accuracy}%</div>
              </Card>

              <Card className="p-3 text-center bg-surface">
                <div className="text-xs text-muted-foreground">Typos</div>
                <div className="mt-1 font-mono text-2xl font-bold text-rose-400">
                  {stats.mistakes}
                </div>
              </Card>
            </div>

            {/* Chat Simulation Conversation Container */}
            <Card className="overflow-hidden border-border bg-surface shadow-md">
              {/* Chat Window Header */}
              <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-base">
                    {currentScenario.customerAvatar}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {currentScenario.customerName}
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[10px] text-muted-foreground">Customer · Online</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  SLA Target: &lt;60s
                </Badge>
              </div>

              {/* Chat Message History */}
              <div className="space-y-4 p-4 md:p-6 bg-background/50">
                {/* Customer Incoming Bubble */}
                <div className="flex items-start gap-2.5 max-w-xl">
                  <div className="text-xl">{currentScenario.customerAvatar}</div>
                  <div className="rounded-2xl rounded-tl-none bg-surface border border-border/70 p-3.5 shadow-sm">
                    <p className="text-xs md:text-sm text-foreground leading-relaxed">
                      {currentScenario.inquiry}
                    </p>
                    <span className="mt-1.5 block text-[10px] text-muted-foreground">Just now</span>
                  </div>
                </div>

                {/* Target Agent Script Reference */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-primary mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Recommended Agent Response (Type this below):
                    </span>
                    <span>{targetText.length} Characters</span>
                  </div>
                  <p className="font-mono text-xs md:text-sm leading-relaxed text-foreground select-none">
                    {targetText}
                  </p>
                </div>
              </div>

              {/* Agent Reply Input Area */}
              <div className="border-t border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" /> Your Live Chat Reply:
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleReset}
                    className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" /> Reset 60s
                  </Button>
                </div>
                <textarea
                  ref={inputRef}
                  value={typedText}
                  onChange={handleInputChange}
                  placeholder="Start typing the agent response above. The 60-second timer will begin automatically..."
                  rows={4}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full resize-none rounded-lg border border-border bg-background p-3 font-mono text-xs md:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Progress: {typedText.length} / {targetText.length} chars (
                    {Math.min(100, Math.round((typedText.length / targetText.length) * 100))}%)
                  </span>
                  <Button
                    size="sm"
                    disabled={typedText.trim().length === 0}
                    onClick={() => {
                      setIsRunning(false);
                      setIsFinished(true);
                      if (timerRef.current) clearInterval(timerRef.current);
                      fireConfetti();
                    }}
                    className="h-7 text-xs bg-primary text-primary-foreground"
                  >
                    <Send className="mr-1 h-3 w-3" /> Send Response
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Assessment Evaluation Results */
          <Card className="p-6 md:p-8 border-primary/40 bg-surface shadow-glow max-w-2xl mx-auto">
            <div className="text-center pb-6 border-b border-border">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Trophy className="h-7 w-7 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">Live Chat Assessment Scorecard</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                60-Second Customer Service Response Evaluation
              </p>
              <div className="mt-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-xs font-semibold">
                  {stats.agentTier}
                </Badge>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-4 py-6 border-b border-border text-center">
              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-xs text-muted-foreground">Chat Speed</div>
                <div className="text-2xl font-bold font-mono text-primary mt-1">
                  {stats.netWpm} <span className="text-xs font-normal">WPM</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {stats.accuracy}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-xs text-muted-foreground">Response SLA</div>
                <div className="text-2xl font-bold font-mono mt-1">
                  {stats.elapsedSeconds}s
                </div>
              </div>
            </div>

            {/* Assessment Feedback */}
            <div className="py-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Candidate Readiness Feedback:
              </div>
              {stats.netWpm >= 50 && stats.accuracy >= 92 ? (
                <p className="text-emerald-300">
                  Excellent work! Your typing speed ({stats.netWpm} WPM) and accuracy ({stats.accuracy}%) meet or exceed hiring benchmarks for live chat support and BPO customer service roles.
                </p>
              ) : (
                <p className="text-amber-300">
                  Good attempt! Focus on reducing backspacing and hitting key punctuation symbols faster to push your speed over the standard 50+ WPM live chat threshold.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 pt-4 border-t border-border">
              <Button onClick={handleReset} className="bg-primary text-primary-foreground">
                <RotateCcw className="mr-2 h-4 w-4" /> Try Ticket Again
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setScenarioIdx((prev) => (prev + 1) % CHAT_SCENARIOS.length);
                  handleReset();
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Next Customer Ticket
              </Button>
            </div>
          </Card>
        )}

        {/* SEO Knowledge & Practice Guide Section */}
        <section className="mt-16 space-y-8">
          <div>
            <h2 className="text-xl font-bold md:text-2xl flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" /> Why Practice the 60-Second Live Chat Typing Test?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Customer support, e-commerce operations, and BPO/KPO assessment tests evaluate candidates on their ability to handle real customer interactions swiftly. Unlike standard typing tests, live chat evaluations measure your ability to format polite conversational replies, include order numbers, and maintain high accuracy under strict SLA countdowns.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-5 border-border bg-surface/40">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Speed Standards
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Most top customer service teams require a minimum of <strong>50 to 60 Net WPM</strong> to manage 2 to 3 concurrent chat tickets efficiently without lagging response times.
              </p>
            </Card>

            <Card className="p-5 border-border bg-surface/40">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Punctuation & Tone
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Live chat tests emphasize proper punctuation (commas, dollar signs, hashes, exclamation marks) which are crucial for professional business correspondence.
              </p>
            </Card>

            <Card className="p-5 border-border bg-surface/40">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" /> Pre-Employment Ready
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Practicing with realistic customer refund, technical, and shipping scenarios prepares you directly for pre-employment screening platforms.
              </p>
            </Card>
          </div>

          {/* FAQs */}
          <div className="pt-4">
            <h2 className="text-xl font-bold md:text-2xl flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions (Live Chat Typing)
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="chat-faq-1" className="rounded-lg border border-border bg-surface/30 px-4">
                <AccordionTrigger className="text-sm font-medium">
                  What is the difference between Live Chat WPM and standard WPM?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Standard WPM often tests continuous random dictionary words. Live Chat WPM measures conversational sentences containing numbers (#84920), currency ($49.00), email addresses, and greeting formulas used in real support conversations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chat-faq-2" className="rounded-lg border border-border bg-surface/30 px-4">
                <AccordionTrigger className="text-sm font-medium">
                  How can I improve my live chat response speed?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Practice touch typing on your number row and symbol keys (Shift + 1-9) without looking down. Familiarize yourself with common customer service macros and greeting patterns to respond fluently.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
    </div>
  );
}
