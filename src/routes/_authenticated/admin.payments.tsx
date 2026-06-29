import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listAllPaymentsAdmin, listSubscriptionsAdmin } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/payments")({ component: PaymentsPage });

function PaymentsPage() {
  const lp = useServerFn(listAllPaymentsAdmin);
  const ls = useServerFn(listSubscriptionsAdmin);
  const payments = useQuery({ queryKey: ["admin-payments"], queryFn: () => lp() });
  const subs = useQuery({ queryKey: ["admin-subs"], queryFn: () => ls() });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Payments & Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Monitor revenue from Stripe / Razorpay flows.
        </p>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 text-sm font-medium">Subscriptions</div>
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Provider</th>
              <th className="p-3 text-left">Renews</th>
            </tr>
          </thead>
          <tbody>
            {(subs.data ?? []).map((s: any) => (
              <tr key={s.id} className="border-t border-border/40">
                <td className="p-3 font-mono text-xs">{s.user_id.slice(0, 8)}</td>
                <td className="p-3">{s.plan}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3">{s.provider ?? "—"}</td>
                <td className="p-3">
                  {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {!subs.data?.length && (
              <tr>
                <td colSpan={5} className="p-4 text-muted-foreground">
                  No subscriptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 text-sm font-medium">Invoices / Payments</div>
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">When</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Provider</th>
              <th className="p-3 text-left">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {(payments.data ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3">{new Date(p.created_at).toLocaleString()}</td>
                <td className="p-3 font-mono text-xs">{p.user_id.slice(0, 8)}</td>
                <td className="p-3 text-right">
                  ${(p.amount_cents / 100).toFixed(2)} {p.currency}
                </td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">{p.provider ?? "—"}</td>
                <td className="p-3">
                  {p.invoice_url ? (
                    <a
                      href={p.invoice_url}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      PDF
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!payments.data?.length && (
              <tr>
                <td colSpan={6} className="p-4 text-muted-foreground">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
