import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminOverview, exportTableCSV } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const fn = useServerFn(getAdminOverview);
  const exp = useServerFn(exportTableCSV);
  const { data } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fn() });

  // build daily test counts from last ~30 days
  const series = (() => {
    const map: Record<string, number> = {};
    (data?.recentTests ?? []).forEach((t: any) => {
      const d = t.created_at.slice(0, 10);
      map[d] = (map[d] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  })();

  const revSeries = (() => {
    const map: Record<string, number> = {};
    (data?.recentPayments ?? []).forEach((p: any) => {
      const d = p.created_at.slice(0, 10);
      map[d] = (map[d] ?? 0) + (p.amount_cents ?? 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cents]) => ({ date, usd: cents / 100 }));
  })();

  async function download(
    table: "profiles" | "typing_results" | "payments" | "subscriptions" | "newsletter_subscribers",
  ) {
    try {
      const r = await exp({ data: { table } });
      const blob = new Blob([r.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${r.count} rows`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          User growth, revenue trends, traffic sources & exports.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 text-sm font-medium">Tests per day</div>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <div className="mb-2 text-sm font-medium">Revenue (USD)</div>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={revSeries}>
                <defs>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="usd" stroke="#22c55e" fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium">Traffic sources</div>
        <p className="text-xs text-muted-foreground">
          Configure Google Analytics, Microsoft Clarity, or Plausible IDs in Settings → Analytics to
          populate this section.
        </p>
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-sm font-medium">Export reports</div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "profiles",
              "typing_results",
              "payments",
              "subscriptions",
              "newsletter_subscribers",
            ] as const
          ).map((t) => (
            <Button key={t} variant="outline" size="sm" onClick={() => download(t)}>
              {t}.csv
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
