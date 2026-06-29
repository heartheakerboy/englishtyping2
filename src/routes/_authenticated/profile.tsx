import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import { getMyProfile, updateMyProfile } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AccountStats } from "@/components/AccountStats";

const profileQuery = queryOptions({ queryKey: ["my-profile"], queryFn: () => getMyProfile() });

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — englishtypingtest.org" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-12 pb-20">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How others see you on the leaderboards and your shared profile.
        </p>
        <Suspense fallback={<div className="mt-10 text-sm text-muted-foreground">Loading…</div>}>
          <ProfileEditor />
        </Suspense>
      </main>
    </div>
  );
}

function ProfileEditor() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const update = useServerFn(updateMyProfile);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    username: profile?.username ?? "",
    display_name: profile?.display_name ?? "",
    bio: profile?.bio ?? "",
    avatar_url: profile?.avatar_url ?? "",
    country: profile?.country ?? "",
    state: profile?.state ?? "",
    city: profile?.city ?? "",
    is_public: profile?.is_public ?? true,
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      update({
        data: {
          username: data.username || null,
          display_name: data.display_name || null,
          bio: data.bio || null,
          avatar_url: data.avatar_url || null,
          country: data.country || null,
          state: data.state || null,
          city: data.city || null,
          is_public: data.is_public,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 space-y-6">
      {profile && <AccountStats profile={profile as never} />}

      <Card className="border-border/60 bg-surface/40 p-6 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
          className="space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-[120px_1fr]">
            <div>
              <Label>Avatar</Label>
              <div className="mt-2 grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-border/60 bg-surface text-3xl font-display">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (form.display_name || form.username || "?").slice(0, 1).toUpperCase()
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="speedy_typer"
              />
              {profile?.username && (
                <Link
                  to="/u/$username"
                  params={{ username: profile.username }}
                  className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                >
                  View public profile <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              maxLength={280}
              placeholder="A short bio…"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-surface/40 p-4">
            <div>
              <div className="font-medium">Public profile</div>
              <p className="text-xs text-muted-foreground">
                Show on leaderboards and let people find you by username.
              </p>
            </div>
            <Switch
              checked={form.is_public}
              onCheckedChange={(v) => setForm({ ...form, is_public: v })}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
