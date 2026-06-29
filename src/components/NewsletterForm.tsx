import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/cms.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm({ source = "site" }: { source?: string }) {
  const sub = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await sub({ data: { email, source } });
      toast.success("Subscribed! Watch your inbox.");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message ?? "Could not subscribe");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
      <Input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={busy || !email}>
        {busy ? "…" : "Subscribe"}
      </Button>
    </form>
  );
}
