import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics } from "@/lib/admin-enterprise.functions";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/card";
import { Users, Eye, Gauge, CreditCard, Crown, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#fb7185",
  "#facc15",
];

export const Route = createFileRoute("/_authenticated/admin/")({ component: AdminIndex });

function AdminIndex() {
  const fn = useServerFn(getDashboardMetrics);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fn(),
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live platform health across visitors, growth, engagement and revenue.
        </p>
      </header>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="Visitors (24h)"
              value={data.pageViews.d1.toLocaleString()}
              sub={`${data.pageViews.d7.toLocaleString()} this week`}
              icon={<Eye className="h-4 w-4" />}
            />
            <StatCard
              label="Signups (24h)"
              value={data.signups.d1.toLocaleString()}
              sub={`${data.signups.d30.toLocaleString()} this month`}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="Tests (24h)"
              value={data.tests.d1.toLocaleString()}
              sub={`${data.tests.d30.toLocaleString()} this month`}
              icon={<Activity className="h-4 w-4" />}
            />
            <StatCard
              label="Revenue (30d)"
              value={`$${(data.revenueCents / 100).toFixed(2)}`}
              sub={`${data.premium} active premium`}
              icon={<CreditCard className="h-4 w-4" />}
              accent
            />
            <StatCard
              label="Visitors (7d)"
              value={data.pageViews.d7.toLocaleString()}
              icon={<Gauge className="h-4 w-4" />}
            />
            <StatCard label="Visitors (30d)" value={data.pageViews.d30.toLocaleString()} />
            <StatCard label="Signups (30d)" value={data.signups.d30.toLocaleString()} />
            <StatCard
              label="Premium users"
              value={data.premium.toLocaleString()}
              icon={<Crown className="h-4 w-4" />}
            />
          </div>

          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium">Last 30 days</h2>
              <div className="text-xs text-muted-foreground">Visitors · Signups · Tests</div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <AreaChart data={data.series} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f472b6" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--surface-elevated))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="pv"
                    name="Visitors"
                    stroke="#22d3ee"
                    fill="url(#g1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="signups"
                    name="Signups"
                    stroke="#a78bfa"
                    fill="url(#g2)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="tests"
                    name="Tests"
                    stroke="#f472b6"
                    fill="url(#g3)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-1">
              <h3 className="mb-2 text-sm font-medium">Devices (7d)</h3>
              <div className="h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.devices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {data.devices.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--surface-elevated))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-4 lg:col-span-1">
              <h3 className="mb-2 text-sm font-medium">Top browsers (30d)</h3>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={data.browsers} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={84}
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--surface-elevated))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="#22d3ee" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-4 lg:col-span-1">
              <h3 className="mb-2 text-sm font-medium">Top countries (30d)</h3>
              <div className="space-y-1.5">
                {data.countries.length === 0 && (
                  <div className="text-xs text-muted-foreground">No data yet.</div>
                )}
                {data.countries.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="truncate">{c.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {c.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
