import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listCoupons, upsertCoupon, deleteCoupon } from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/coupons")({ component: CouponsPage });

type Coupon = {
  id?: string;
  code: string;
  description?: string | null;
  percent_off?: number | null;
  amount_off_cents?: number | null;
  currency: string;
  max_redemptions?: number | null;
  expires_at?: string | null;
  is_active: boolean;
};

function CouponsPage() {
  const list = useServerFn(listCoupons);
  const save = useServerFn(upsertCoupon);
  const del = useServerFn(deleteCoupon);
  const { data, refetch } = useQuery({ queryKey: ["admin-coupons"], queryFn: () => list() });
  const [edit, setEdit] = useState<Coupon | null>(null);

  async function onSave(c: Coupon) {
    try {
      await save({ data: c });
      toast.success("Saved");
      setEdit(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete coupon?")) return;
    try {
      await del({ data: { id } });
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
        <Button onClick={() => setEdit({ code: "", currency: "USD", is_active: true })}>
          New coupon
        </Button>
      </header>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Discount</th>
              <th className="p-3 text-left">Redeemed</th>
              <th className="p-3 text-left">Expires</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">
                  {c.percent_off
                    ? `${c.percent_off}%`
                    : c.amount_off_cents
                      ? `$${(c.amount_off_cents / 100).toFixed(2)}`
                      : "—"}
                </td>
                <td className="p-3">
                  {c.redeemed_count}/{c.max_redemptions ?? "∞"}
                </td>
                <td className="p-3">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}
                </td>
                <td className="p-3">{c.is_active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setEdit(c)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-2" onClick={() => onDelete(c.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={6} className="p-4 text-muted-foreground">
                  No coupons.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Edit coupon" : "New coupon"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                className="col-span-2"
                placeholder="CODE"
                value={edit.code}
                onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })}
              />
              <Input
                type="number"
                placeholder="% off"
                value={edit.percent_off ?? ""}
                onChange={(e) =>
                  setEdit({ ...edit, percent_off: e.target.value ? Number(e.target.value) : null })
                }
              />
              <Input
                type="number"
                placeholder="Amount off (cents)"
                value={edit.amount_off_cents ?? ""}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    amount_off_cents: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                placeholder="Currency"
                value={edit.currency}
                onChange={(e) => setEdit({ ...edit, currency: e.target.value.toUpperCase() })}
              />
              <Input
                type="number"
                placeholder="Max redemptions"
                value={edit.max_redemptions ?? ""}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    max_redemptions: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
              <Input
                className="col-span-2"
                type="datetime-local"
                value={edit.expires_at ? edit.expires_at.slice(0, 16) : ""}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    expires_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
              />
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={edit.is_active}
                  onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })}
                />{" "}
                Active
              </label>
              <div className="col-span-2 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEdit(null)}>
                  Cancel
                </Button>
                <Button onClick={() => onSave(edit)}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
