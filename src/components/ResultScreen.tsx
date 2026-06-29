import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Save, Check, Loader2, Award } from "lucide-react";
import type { FinishedRun } from "@/components/TypingTest";
import { useServerFn } from "@tanstack/react-start";
import { saveResult } from "@/lib/results.functions";
import { createCertificate } from "@/lib/account.functions";
import { tickTestMissions } from "@/lib/missions.functions";
import { supabase } from "@/integrations/supabase/client";
import { Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AICoachPanel } from "@/components/AICoachPanel";
import { fireConfetti } from "@/components/Confetti";
import { sfx } from "@/lib/sound";
import { useTranslation } from "react-i18next";

interface Props {
  run: FinishedRun;
  onRestart: () => void;
}

export function ResultScreen({ run, onRestart }: Props) {
  const { t } = useTranslation("results");
  const save = useServerFn(saveResult);
  const tickMissions = useServerFn(tickTestMissions);
  const issueCert = useServerFn(createCertificate);
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [certIssuing, setCertIssuing] = useState(false);

  useEffect(() => {
    sfx.finish();
    if (run.live.accuracy >= 95 && run.live.wpm >= 40) fireConfetti({ intensity: "medium" });
  }, [run.live.accuracy, run.live.wpm]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  useEffect(() => {
    if (authed !== true || saved || saving) return;
    setSaving(true);
    save({
      data: {
        mode: run.mode,
        mode_value: run.modeValue,
        wpm: run.live.wpm,
        raw_wpm: run.live.rawWpm,
        accuracy: run.live.accuracy,
        cpm: run.live.cpm,
        consistency: run.consistency || null,
        chars_correct: run.chars.correct,
        chars_incorrect: run.chars.incorrect,
        chars_extra: run.chars.extra,
        chars_missed: run.chars.missed,
        duration_seconds: run.durationSeconds,
        language: run.language ?? "english",
      },
    })
      .then(() => {
        setSaved(true);
        toast.success(t("save.savedToast"));
        tickMissions({ data: { wpm: run.live.wpm, accuracy: run.live.accuracy } })
          .then((r) => {
            if (r.completed?.length) toast.success(t("save.missionComplete"));
          })
          .catch(() => undefined);
      })
      .catch((e) => toast.error(e?.message ?? t("save.failed")))
      .finally(() => setSaving(false));
  }, [authed, saved, saving, run, save, tickMissions]);

  const chartData = useMemo(() => {
    const data = [
      { t: 0, wpm: 0, raw: 0, errors: 0 },
      ...run.samples.map((s) => ({ t: s.t, wpm: s.wpm, raw: s.rawWpm, errors: s.errors })),
    ];
    // include final point
    data.push({
      t: Math.round(run.durationSeconds),
      wpm: run.live.wpm,
      raw: run.live.rawWpm,
      errors: run.chars.incorrect + run.chars.extra,
    });
    return data;
  }, [run]);

  const topMistakes = useMemo(() => {
    return Object.entries(run.mistakeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [run.mistakeMap]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <BigStat label={t("stats.netWpm")} value={run.live.wpm} accent delay={0} />
        <BigStat label={t("stats.grossWpm")} value={run.live.rawWpm} delay={0.05} />
        <BigStat label={t("stats.accuracy")} value={`${run.live.accuracy}%`} delay={0.1} />
        <BigStat label={t("stats.cpm")} value={run.live.cpm} delay={0.15} />
        <BigStat label={t("stats.consistency")} value={`${run.consistency}%`} delay={0.2} />
      </div>

      <Card className="border-border/60 bg-surface/50 p-4 backdrop-blur md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("chart.title")}
          </h3>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> {t("chart.wpm")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> {t("chart.raw")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive" /> {t("chart.errors")}
            </span>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.22 290)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="oklch(0.68 0.22 290)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={(v) => `${v}s`}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--color-popover-foreground)",
                }}
                labelFormatter={(l) => `${l}s`}
              />
              <Area
                type="monotone"
                dataKey="wpm"
                stroke="oklch(0.68 0.22 290)"
                strokeWidth={2.5}
                fill="url(#wpmFill)"
              />
              <Line
                type="monotone"
                dataKey="raw"
                stroke="oklch(0.78 0.18 195)"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="oklch(0.65 0.24 22)"
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-surface/50 p-5 backdrop-blur md:col-span-2">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("detail.title")}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
            <Mini label={t("detail.mode")} value={`${run.mode} ${run.modeValue}`} />
            <Mini label={t("detail.duration")} value={`${run.durationSeconds.toFixed(1)}s`} />
            <Mini label={t("stats.consistency")} value={`${run.consistency}%`} />
            <Mini
              label={t("detail.characters")}
              value={
                <span className="font-mono text-xs">
                  <span className="text-success">{run.chars.correct}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-destructive">{run.chars.incorrect}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-warning">{run.chars.extra}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{run.chars.missed}</span>
                </span>
              }
            />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">{t("detail.charLegend")}</p>
        </Card>

        <Card className="border-border/60 bg-surface/50 p-5 backdrop-blur">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("mistakes.title")}
          </h3>
          {topMistakes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{t("mistakes.none")}</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topMistakes.map(([ch, n]) => (
                <span
                  key={ch}
                  className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 font-mono text-xs"
                >
                  <span className="text-foreground">{ch}</span>
                  <span className="text-destructive">×{n}</span>
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      <AICoachPanel run={run} language={run.language ?? "english"} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {authed === true && saving && (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("save.saving")}
            </span>
          )}
          {authed === true && saved && (
            <span className="inline-flex items-center gap-1.5 text-success">
              <Check className="h-3.5 w-3.5" /> {t("save.saved")}
            </span>
          )}
          {authed === false && (
            <span>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="text-primary underline-offset-4 hover:underline"
              >
                {t("save.signupCta")}
              </Link>{" "}
              {t("save.signupPrompt")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {authed === true && (
            <>
              <Button
                variant="outline"
                disabled={certIssuing}
                onClick={async () => {
                  setCertIssuing(true);
                  try {
                    const cert = await issueCert({
                      data: {
                        wpm: run.live.wpm,
                        accuracy: run.live.accuracy,
                        cpm: run.live.cpm,
                        mode: run.mode,
                        mode_value: run.modeValue,
                        language: run.language ?? "english",
                      },
                    });
                    toast.success(t("actions.certIssued", { id: cert.id }));
                    router.navigate({ to: "/certificate/$id", params: { id: cert.id } });
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : t("actions.certFailed"));
                  } finally {
                    setCertIssuing(false);
                  }
                }}
              >
                {certIssuing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Award className="h-4 w-4" />
                )}{" "}
                {t("actions.generateCertificate")}
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard">
                  <Save className="h-4 w-4" /> {t("actions.dashboard")}
                </Link>
              </Button>
            </>
          )}
          <Button
            onClick={onRestart}
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" /> {t("actions.nextTest")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function BigStat({
  label,
  value,
  accent,
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }}
      className="rounded-2xl border border-border/60 bg-surface/50 p-5 backdrop-blur md:p-6"
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`mt-2 font-display text-4xl font-semibold tabular-nums md:text-5xl ${accent ? "text-gradient" : "text-foreground"}`}
      >
        {value}
      </div>
    </motion.div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-medium">{value}</div>
    </div>
  );
}
