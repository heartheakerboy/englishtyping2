import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Send, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/report-error")({
  head: () => ({
    meta: [
      { title: "Report an Error or Calculation Issue — EnglishTypingTest.org" },
      {
        name: "description",
        content:
          "Report a typing calculation error, incorrect WPM score, test text typo, or broken feature to the EnglishTypingTest.org engineering team.",
      },
      { property: "og:title", content: "Report an Error — EnglishTypingTest.org" },
      {
        property: "og:description",
        content:
          "Report a typing calculation error, incorrect WPM score, test text typo, or broken feature to the EnglishTypingTest.org engineering team.",
      },
      { property: "og:url", content: "https://www.englishtypingtest.org/report-error" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.englishtypingtest.org/report-error" }],
  }),
  component: ReportErrorPage,
});

function ReportErrorPage() {
  const [category, setCategory] = useState("wpm_calculation");
  const [pageUrl, setPageUrl] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [actualResult, setActualResult] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Prepare mailto link with encoded parameters as fallback and primary delivery
    const subject = encodeURIComponent(`[Error Report] ${category}: ${pageUrl || "General"}`);
    const body = encodeURIComponent(
      `Error Category: ${category}\n` +
      `Page / Feature URL: ${pageUrl || "N/A"}\n\n` +
      `Expected Result:\n${expectedResult}\n\n` +
      `Actual Result Observed:\n${actualResult}\n\n` +
      `Additional Details / Reproduction Steps:\n${details}\n\n` +
      `Browser / Device: ${typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}`
    );

    window.open(`mailto:support@englishtypingtest.org?subject=${subject}&body=${body}`, "_blank");
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <Breadcrumbs />

        <div className="mt-6 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Quality Assurance &amp; Integrity
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl text-foreground">
            Report an Error or Calculation Issue
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Help us maintain mathematical accuracy, error-free typing passages, and flawless test timing. Every
            report is reviewed directly by our engineering and editorial maintainers.
          </p>
        </div>

        <div className="mt-8">
          {submitted ? (
            <Card className="p-8 border-success/30 bg-success/10 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h2 className="text-2xl font-bold text-foreground">Report Prepared Successfully</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Your email client has been opened with your structured report addressed to{" "}
                <strong className="text-foreground">support@englishtypingtest.org</strong>. If it did not open
                automatically, you can email us directly with your report details.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="text-sm"
                >
                  Submit Another Report
                </Button>
              </div>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="p-6 border-border/70 bg-surface/20 space-y-5">
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-1">
                    Problem Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="wpm_calculation">Incorrect WPM / CPM Calculation</option>
                    <option value="accuracy_calculation">Accuracy / Mistake Count Discrepancy</option>
                    <option value="typo_passage">Typo or Grammatical Error in Test Passage</option>
                    <option value="broken_timer">Test Timer / Clock Drift Glitch</option>
                    <option value="educational_claim">Inaccurate Educational or Syllabi Claim</option>
                    <option value="arcade_game">Arcade Game Bug (CPS, Reaction, Memory)</option>
                    <option value="other">Other Technical Issue</option>
                  </select>
                </div>

                {/* Page URL */}
                <div>
                  <label htmlFor="pageUrl" className="block text-sm font-semibold text-foreground mb-1">
                    Page or Feature URL
                  </label>
                  <input
                    type="text"
                    id="pageUrl"
                    value={pageUrl}
                    onChange={(e) => setPageUrl(e.target.value)}
                    placeholder="e.g. https://www.englishtypingtest.org/test or /ssc-cgl-typing-test"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Expected Result */}
                <div>
                  <label htmlFor="expectedResult" className="block text-sm font-semibold text-foreground mb-1">
                    Expected Result <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="expectedResult"
                    rows={2}
                    required
                    value={expectedResult}
                    onChange={(e) => setExpectedResult(e.target.value)}
                    placeholder="What should have happened mathematically or functionally? (e.g. 'At 300 correct characters in 60s, Net WPM should be 60 WPM')"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Actual Result */}
                <div>
                  <label htmlFor="actualResult" className="block text-sm font-semibold text-foreground mb-1">
                    Actual Result Observed <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="actualResult"
                    rows={2}
                    required
                    value={actualResult}
                    onChange={(e) => setActualResult(e.target.value)}
                    placeholder="What did you actually observe? (e.g. 'Screen displayed 52 WPM or timer jumped 2 seconds')"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Additional Details */}
                <div>
                  <label htmlFor="details" className="block text-sm font-semibold text-foreground mb-1">
                    Steps to Reproduce &amp; Additional Context
                  </label>
                  <textarea
                    id="details"
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide any additional details, keys typed, browser name, operating system, or error text..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Error Report
                  </Button>
                </div>
              </Card>
            </form>
          )}

          {/* Review Process Explanation */}
          <div className="mt-10 rounded-xl border border-border/80 bg-surface/10 p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              How Reports Are Processed
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li>
                <strong>Triage:</strong> Reports are categorized into engine bugs, typographical errors in test
                passages, or content clarifications.
              </li>
              <li>
                <strong>Verification:</strong> Engine issues are reproduced against local unit tests in{" "}
                <code className="text-xs bg-surface/50 px-1 py-0.5 rounded font-mono">src/lib/typing-engine.ts</code>.
              </li>
              <li>
                <strong>Resolution:</strong> Verified code and content fixes are deployed promptly. If an error
                influenced scoring rules, the update is logged on our Methodology page.
              </li>
              <li>
                <strong>Direct Contact:</strong> You can also reach our engineering maintainers directly via{" "}
                <a href="mailto:support@englishtypingtest.org" className="text-primary underline">
                  support@englishtypingtest.org
                </a>
                .
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
