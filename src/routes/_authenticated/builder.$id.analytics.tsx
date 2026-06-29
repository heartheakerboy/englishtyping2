// Creator analytics dashboard for a single test.
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getTestAnalytics } from "@/lib/custom-tests.functions";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/builder/$id/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { id } = useParams({ from: "/_authenticated/builder/$id/analytics" });
  const fn = useServerFn(getTestAnalytics);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fn({ data: { id } })
      .then((r) => {
        setData(r);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, fn]);

  if (loading)
    return (
      <div className="py-16 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  if (!data?.test) return <div className="py-16 text-center text-muted-foreground">Not found</div>;

  const deviceData = Object.entries(data.byDevice).map(([name, count]) => ({ name, count }));
  const browserData = Object.entries(data.byBrowser).map(([name, count]) => ({ name, count }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">{data.test.name}</h1>
        <p className="text-sm text-muted-foreground">Creator analytics</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Views" value={data.views} />
        <Stat label="Attempts" value={data.attempts} />
        <Stat label="Completed" value={data.completed} />
        <Stat label="Completion rate" value={`${data.completionRate.toFixed(0)}%`} />
        <Stat label="Avg WPM" value={data.avgWpm.toFixed(1)} />
        <Stat label="Avg accuracy" value={`${data.avgAccuracy.toFixed(1)}%`} />
        <Stat label="Pass rate" value={`${data.passRate.toFixed(0)}%`} />
        <Stat
          label="Flagged"
          value={data.flaggedCount}
          tone={data.flaggedCount > 0 ? "destructive" : undefined}
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="By device">
          {deviceData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deviceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </ChartCard>
        <ChartCard title="By browser">
          {browserData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={browserData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </ChartCard>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-display text-sm font-semibold mb-3">Top performers</h3>
        {data.topPerformers.length === 0 ? (
          <Empty />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">User</th>
                <th className="text-right">WPM</th>
                <th className="text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {data.topPerformers.map((p: any, i: number) => (
                <tr key={p.id} className="border-t border-border/50">
                  <td className="py-1.5">{i + 1}</td>
                  <td>{p.email || p.user_id?.slice(0, 8) || "anon"}</td>
                  <td className="text-right tabular-nums">{Number(p.wpm).toFixed(1)}</td>
                  <td className="text-right tabular-nums">{Number(p.accuracy).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: any; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-semibold ${tone === "destructive" ? "text-destructive" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="font-display text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Empty() {
  return <p className="py-6 text-center text-xs text-muted-foreground">No data yet.</p>;
}
