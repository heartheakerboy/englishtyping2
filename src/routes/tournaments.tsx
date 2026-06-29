import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Trophy, CalendarDays, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/tournaments")({
  head: () => ({
    meta: [
      { title: "Typing Tournaments — englishtypingtest.org" },
      {
        name: "description",
        content: "Compete in scheduled typing tournaments. Climb the bracket, win XP & coins.",
      },
    ],
  }),
  component: Tournaments,
});

// Simple deterministic schedule — next 3 Saturdays.
function buildSchedule() {
  const now = new Date();
  const out: {
    id: string;
    name: string;
    starts_at: Date;
    prize_xp: number;
    prize_coins: number;
    status: "upcoming" | "live";
  }[] = [];
  const day = now.getUTCDay();
  const daysUntilSat = (6 - day + 7) % 7 || 7;
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + daysUntilSat + i * 7);
    d.setUTCHours(18, 0, 0, 0);
    out.push({
      id: `weekly-${d.toISOString().slice(0, 10)}`,
      name: i === 0 ? "Weekly Showdown" : i === 1 ? "Speed Royale" : "Accuracy Grand Prix",
      starts_at: d,
      prize_xp: 500 + i * 250,
      prize_coins: 200 + i * 100,
      status: "upcoming",
    });
  }
  return out;
}

function Tournaments() {
  const events = buildSchedule();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-12">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Tournaments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Scheduled competitive events. Sign up, race the bracket, win rewards.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {events.map((e) => (
            <Card key={e.id} className="border-border/60 bg-surface/40 p-5 backdrop-blur">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />{" "}
                    {e.starts_at.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    ·{" "}
                    {e.starts_at.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <h2 className="mt-1 font-display text-xl font-semibold">{e.name}</h2>
                </div>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> {e.prize_xp} XP
                </span>
                <span className="inline-flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-warning" /> {e.prize_coins}
                </span>
              </div>
              <Button
                asChild
                className="mt-5 w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                <Link to="/race">Open lobby</Link>
              </Button>
            </Card>
          ))}
        </div>

        <Card className="mt-10 border-dashed border-border/60 bg-surface/30 p-8 text-center">
          <h2 className="font-display text-lg font-semibold">Custom tournaments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a private room and share the invite to host your own bracket.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/race">Create a room</Link>
          </Button>
        </Card>
      </main>
    </div>
  );
}
