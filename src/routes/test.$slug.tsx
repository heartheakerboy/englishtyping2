// Public custom test runner page: /test/$slug
// Loads test, handles password gate, runs CustomTestRunner, shows result.
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  getPublicTestBySlug,
  verifyTestPassword,
  submitAttempt,
  incrementTestView,
  getTestLeaderboard,
} from "@/lib/custom-tests.functions";
import { CustomTestRunner, type CustomRunResult } from "@/components/builder/CustomTestRunner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Trophy, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { fireConfetti } from "@/components/Confetti";
import { Header as SiteHeader } from "@/components/Header";

export const Route = createFileRoute("/test/$slug")({
  component: () => (
    <>
      <SiteHeader />
      <PublicTestPage />
    </>
  ),
});

function detectDeviceBrowser() {
  if (typeof navigator === "undefined") return { device: "unknown", browser: "unknown" };
  const ua = navigator.userAgent;
  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
  let browser = "other";
  if (/Edg/i.test(ua)) browser = "edge";
  else if (/Chrome/i.test(ua)) browser = "chrome";
  else if (/Safari/i.test(ua)) browser = "safari";
  else if (/Firefox/i.test(ua)) browser = "firefox";
  return { device, browser };
}

function PublicTestPage() {
  const { slug } = useParams({ from: "/test/$slug" });
  const fetch = useServerFn(getPublicTestBySlug);
  const verify = useServerFn(verifyTestPassword);
  const submit = useServerFn(submitAttempt);
  const bumpView = useServerFn(incrementTestView);
  const fetchBoard = useServerFn(getTestLeaderboard);

  const [test, setTest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [result, setResult] = useState<CustomRunResult | null>(null);
  const [board, setBoard] = useState<any[]>([]);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    fetch({ data: { slug } })
      .then((t: any) => {
        setTest(t);
        setLoading(false);
        if (t) {
          if (!t.password_protected) setAuthed(true);
          // expiry / start gating
          const now = Date.now();
          if (t.expires_at && now > new Date(t.expires_at).getTime()) setExpired(true);
          if (t.start_at && now < new Date(t.start_at).getTime()) setExpired(true);
          bumpView({ data: { test_id: t.id } }).catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, [slug, fetch, bumpView]);

  async function handlePwd() {
    setPwdError(null);
    const r: any = await verify({ data: { slug, password: pwd } });
    if (r.ok) setAuthed(true);
    else setPwdError("Incorrect password");
  }

  async function handleFinish(run: CustomRunResult) {
    setResult(run);
    const { device, browser } = detectDeviceBrowser();
    try {
      await submit({
        data: {
          test_id: test.id,
          wpm: run.wpm,
          raw_wpm: run.raw_wpm,
          accuracy: run.accuracy,
          consistency: run.consistency,
          mistakes: run.mistakes,
          duration_actual: run.duration_actual,
          flag_reasons: run.flag_reasons,
          device,
          browser,
        },
      });
      if (test.leaderboard_enabled && test.leaderboard_visibility === "public") {
        const rows = await fetchBoard({ data: { test_id: test.id, limit: 10 } });
        setBoard(rows as any[]);
      }
    } catch {}
  }

  if (loading)
    return (
      <div className="py-24 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  if (!test)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl">Test not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This test may be unpublished or removed.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Home</Link>
        </Button>
      </div>
    );

  if (expired)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
        <h1 className="mt-4 font-display text-2xl">Test not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This test is closed or hasn't started yet.
        </p>
      </div>
    );

  if (!authed)
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <div className="rounded-xl border border-border bg-surface p-6">
          <Lock className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-3 text-center font-display text-xl">Password required</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{test.name}</p>
          <Input
            className="mt-4"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Enter password"
            onKeyDown={(e) => e.key === "Enter" && handlePwd()}
          />
          {pwdError && <p className="mt-2 text-xs text-destructive">{pwdError}</p>}
          <Button
            className="mt-3 w-full bg-gradient-primary text-primary-foreground"
            onClick={handlePwd}
          >
            Unlock
          </Button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Header test={test} />
      {!result ? (
        <CustomTestRunner test={test} onFinish={handleFinish} />
      ) : (
        <ResultPanel test={test} result={result} board={board} onRetry={() => setResult(null)} />
      )}
    </div>
  );
}

function Header({ test }: { test: any }) {
  return (
    <div className="space-y-3">
      {test.banner_url && (
        <img src={test.banner_url} alt="" className="h-32 w-full rounded-xl object-cover" />
      )}
      <div className="flex items-start gap-4">
        {test.cover_image_url && (
          <img src={test.cover_image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold">{test.name}</h1>
            <Badge variant="outline">{test.difficulty}</Badge>
            <Badge variant="outline">{test.duration_seconds}s</Badge>
          </div>
          {test.description && (
            <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-1">
            {(test.tags ?? []).map((t: string) => (
              <span
                key={t}
                className="rounded bg-surface px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultPanel({
  test,
  result,
  board,
  onRetry,
}: {
  test: any;
  result: CustomRunResult;
  board: any[];
  onRetry: () => void;
}) {
  const stats = test.result_visible_stats || {};
  const passes =
    result.wpm >= (test.cert_min_wpm ?? 0) && result.accuracy >= (test.cert_min_accuracy ?? 0);
  const showCert = test.certificate_enabled && stats.certificate && passes;

  useEffect(() => {
    if (showCert) fireConfetti({ intensity: "high" });
  }, [showCert]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl">Your result</h2>
        {result.flag_reasons.length > 0 && (
          <p className="mt-2 text-xs text-destructive">
            <AlertTriangle className="inline h-3 w-3" /> Flagged: {result.flag_reasons.join(", ")}
          </p>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.wpm && <Metric label="WPM" value={result.wpm.toFixed(1)} highlight />}
          {stats.accuracy && <Metric label="Accuracy" value={`${result.accuracy.toFixed(1)}%`} />}
          {stats.consistency && <Metric label="Consistency" value={`${result.consistency}%`} />}
          {stats.mistakes && <Metric label="Mistakes" value={result.mistakes} />}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={onRetry} variant="outline">
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Retry
          </Button>
          {showCert && (
            <Button className="bg-gradient-primary text-primary-foreground">
              <Award className="mr-1 h-3.5 w-3.5" /> Certificate
            </Button>
          )}
        </div>
      </div>

      {test.leaderboard_enabled && stats.ranking && board.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
            <Trophy className="h-4 w-4 text-primary" /> Leaderboard
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {board.map((r: any, i: number) => (
                <tr key={r.id} className="border-t border-border/50">
                  <td className="py-1.5 text-muted-foreground">#{i + 1}</td>
                  <td>{r.email || r.user_id?.slice(0, 8) || "anon"}</td>
                  <td className="text-right tabular-nums">{Number(r.wpm).toFixed(1)} wpm</td>
                  <td className="text-right text-xs text-muted-foreground tabular-nums">
                    {Number(r.accuracy).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-semibold tabular-nums ${highlight ? "text-primary" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
