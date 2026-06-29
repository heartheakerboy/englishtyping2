import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { getPublicProfile, toggleFollow, isFollowing } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Zap, Trophy, Coins, UserPlus, UserCheck, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const data = await getPublicProfile({ data: { username: params.username } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `@${loaderData.profile.username} — englishtypingtest.org` },
          {
            name: "description",
            content: `${loaderData.profile.display_name ?? loaderData.profile.username} — ${Number(loaderData.profile.best_wpm).toFixed(0)} WPM best, level ${loaderData.profile.level}.`,
          },
          {
            property: "og:title",
            content: `@${loaderData.profile.username} on englishtypingtest.org`,
          },
          {
            property: "og:description",
            content: `${Number(loaderData.profile.best_wpm).toFixed(0)} WPM • Level ${loaderData.profile.level} • ${loaderData.profile.tests_completed} tests`,
          },
        ]
      : [],
  }),
  errorComponent: () => <ErrorView />,
  notFoundComponent: () => <ErrorView />,
  component: PublicProfilePage,
});

function ErrorView() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-xl px-6 pt-24 pb-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Profile not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This user does not exist or has hidden their profile.
        </p>
        <Button asChild className="mt-6">
          <Link to="/leaderboard">Browse leaderboard</Link>
        </Button>
      </main>
    </div>
  );
}

function PublicProfilePage() {
  const data = Route.useLoaderData();
  const { profile, recent, achievements, followerCount, followingCount } = data;
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const toggle = useServerFn(toggleFollow);
  const check = useServerFn(isFollowing);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      setMeId(data.user?.id ?? null);
      if (data.user && data.user.id !== profile.id) {
        check({ data: { targetUserId: profile.id } }).then((r) => setFollowing(r.following));
      }
    });
  }, [profile.id, check]);

  const handleFollow = async () => {
    try {
      const r = await toggle({ data: { targetUserId: profile.id } });
      setFollowing(r.following);
      toast.success(r.following ? "Following" : "Unfollowed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const initials = (profile.display_name || profile.username || "?").slice(0, 2).toUpperCase();
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-20">
        <Card className="border-border/60 bg-surface/40 p-6 backdrop-blur">
          <div className="flex flex-wrap items-start gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-primary text-2xl font-display font-bold text-primary-foreground shadow-glow">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold leading-tight">
                  {profile.display_name || profile.username}
                </h1>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                  @{profile.username}
                </span>
                <span className="rounded-full bg-gradient-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  Lv {profile.level}
                </span>
              </div>
              {profile.bio && (
                <p className="mt-2 max-w-prose text-sm text-muted-foreground">{profile.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {location}
                  </span>
                )}
                <span>
                  <span className="font-mono text-foreground tabular-nums">{followerCount}</span>{" "}
                  followers
                </span>
                <span>
                  <span className="font-mono text-foreground tabular-nums">{followingCount}</span>{" "}
                  following
                </span>
                <span>
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            {authed && meId !== profile.id && (
              <Button
                onClick={handleFollow}
                variant={following ? "outline" : "default"}
                className={
                  following
                    ? ""
                    : "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                }
              >
                {following ? (
                  <>
                    <UserCheck className="h-4 w-4" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Follow
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              icon={Zap}
              label="Best WPM"
              value={Number(profile.best_wpm).toFixed(0)}
              accent
            />
            <StatTile icon={Flame} label="Streak" value={`${profile.current_streak}d`} />
            <StatTile icon={Trophy} label="Tests" value={profile.tests_completed} />
            <StatTile icon={Coins} label="Coins" value={profile.coins} />
          </div>
        </Card>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 bg-surface/40 p-5 backdrop-blur">
            <h2 className="font-display text-lg font-semibold">
              Achievements ({achievements.length})
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {achievements.length === 0 && (
                <p className="text-sm text-muted-foreground">No achievements yet.</p>
              )}
              {achievements.map(
                (a: {
                  code: string;
                  achievements: { name?: string; description?: string } | null;
                }) => (
                  <span
                    key={a.code}
                    className="rounded-full border border-border/60 bg-surface px-2.5 py-1 text-xs"
                    title={a.achievements?.description ?? ""}
                  >
                    🏆 {a.achievements?.name ?? a.code}
                  </span>
                ),
              )}
            </div>
          </Card>

          <Card className="border-border/60 bg-surface/40 p-5 backdrop-blur">
            <h2 className="font-display text-lg font-semibold">Recent tests</h2>
            <div className="mt-3 space-y-2">
              {recent.length === 0 && (
                <p className="text-sm text-muted-foreground">No tests yet.</p>
              )}
              {recent
                .slice(0, 10)
                .map(
                  (r: {
                    id: string;
                    mode: string;
                    mode_value: number;
                    wpm: number | string;
                    accuracy: number | string;
                    created_at: string;
                  }) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-md bg-surface/60 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs rounded bg-background px-1.5 py-0.5">
                          {r.mode} {r.mode_value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono tabular-nums text-primary">
                          {Number(r.wpm).toFixed(0)} wpm
                        </span>
                        <span className="font-mono tabular-nums text-xs text-muted-foreground">
                          {Number(r.accuracy).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ),
                )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div
        className={`mt-1 font-display text-2xl font-semibold tabular-nums ${accent ? "text-gradient" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
