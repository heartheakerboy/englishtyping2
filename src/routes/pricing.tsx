import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — English Typing Test" },
      {
        name: "description",
        content:
          "Free forever core typing platform. Premium unlocks unlimited AI, no ads, and advanced analytics.",
      },
      { property: "og:title", content: "Pricing — English Typing Test" },
      {
        property: "og:description",
        content:
          "Free forever core platform. Premium adds unlimited AI coaching, ad-free experience and advanced analytics.",
      },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
});

const PLANS = [
  {
    name: "Free",
    price: "$0",
    sub: "Forever",
    features: [
      "Unlimited typing tests",
      "11 languages + RTL",
      "Multiplayer rooms",
      "Public leaderboards",
      "Basic stats",
    ],
    cta: { label: "Start free", to: "/test" },
  },
  {
    name: "Premium",
    price: "$5",
    sub: "/month",
    accent: true,
    features: [
      "Everything in Free",
      "Unlimited AI coach",
      "Daily AI challenges",
      "Advanced heatmap analytics",
      "PDF certificates",
      "Ad-free experience",
    ],
    cta: { label: "Upgrade", to: "/auth" },
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <header className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight">Simple pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Free to learn. Premium when you're ready to go pro.
          </p>
        </header>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PLANS.map((p) => (
            <Card key={p.name} className={`p-6 ${p.accent ? "border-primary/40 shadow-glow" : ""}`}>
              <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {p.name}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${p.accent ? "text-gradient" : ""}`}>
                  {p.price}
                </span>
                <span className="text-sm text-muted-foreground">{p.sub}</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={p.accent ? "default" : "outline"}>
                <Link to={p.cta.to as any}>{p.cta.label}</Link>
              </Button>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Premium billing via Stripe & Razorpay. Cancel anytime.
        </p>
      </main>
    </div>
  );
}
