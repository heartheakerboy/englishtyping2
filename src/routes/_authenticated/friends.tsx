import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { listFriends, activityFeed } from "@/lib/account.functions";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const friendsQuery = queryOptions({ queryKey: ["friends"], queryFn: () => listFriends() });
const feedQuery = queryOptions({ queryKey: ["activity-feed"], queryFn: () => activityFeed() });

export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({ meta: [{ title: "Friends — englishtypingtest.org" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(friendsQuery);
    context.queryClient.ensureQueryData(feedQuery);
  },
  component: FriendsPage,
});

function FriendsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-12 pb-20">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Friends</h1>
        <p className="mt-1 text-sm text-muted-foreground">See what people you follow are typing.</p>

        <Tabs defaultValue="feed" className="mt-8">
          <TabsList>
            <TabsTrigger value="feed">
              <Activity className="h-3.5 w-3.5" /> Activity feed
            </TabsTrigger>
            <TabsTrigger value="following">
              <Users className="h-3.5 w-3.5" /> Following
            </TabsTrigger>
            <TabsTrigger value="followers">
              <Users className="h-3.5 w-3.5" /> Followers
            </TabsTrigger>
          </TabsList>
          <Suspense fallback={<div className="mt-6 text-sm text-muted-foreground">Loading…</div>}>
            <TabsContent value="feed">
              <Feed />
            </TabsContent>
            <TabsContent value="following">
              <FollowList type="following" />
            </TabsContent>
            <TabsContent value="followers">
              <FollowList type="followers" />
            </TabsContent>
          </Suspense>
        </Tabs>
      </main>
    </div>
  );
}

function Feed() {
  const { data } = useSuspenseQuery(feedQuery);
  if (!data || data.length === 0) {
    return <EmptyCard message="No activity yet — follow some typists to see their results here." />;
  }
  return (
    <div className="mt-6 space-y-2">
      {data.map((r) => (
        <Card
          key={r.id}
          className="flex items-center justify-between border-border/60 bg-surface/40 p-4 backdrop-blur"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
              {r.profile?.avatar_url ? (
                <img src={r.profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (r.profile?.display_name || r.profile?.username || "?").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm">
                {r.profile?.username ? (
                  <Link
                    to="/u/$username"
                    params={{ username: r.profile.username }}
                    className="font-medium hover:text-primary"
                  >
                    {r.profile.display_name || r.profile.username}
                  </Link>
                ) : (
                  "Someone"
                )}{" "}
                <span className="text-muted-foreground">
                  finished a {r.mode} {r.mode_value} test
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-lg font-semibold tabular-nums text-primary">
              {Number(r.wpm).toFixed(0)}
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {Number(r.accuracy).toFixed(1)}%
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FollowList({ type }: { type: "following" | "followers" }) {
  const { data } = useSuspenseQuery(friendsQuery);
  const list = data[type];
  if (!list || list.length === 0) {
    return (
      <EmptyCard
        message={type === "following" ? "You aren't following anyone yet." : "No followers yet."}
      />
    );
  }
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {list.map(
        (p) =>
          p && (
            <Card
              key={p.id}
              className="flex items-center gap-3 border-border/60 bg-surface/40 p-4 backdrop-blur"
            >
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-gradient-primary font-bold text-primary-foreground">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (p.display_name || p.username || "?").slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                {p.username ? (
                  <Link
                    to="/u/$username"
                    params={{ username: p.username }}
                    className="block truncate font-medium hover:text-primary"
                  >
                    {p.display_name || p.username}
                  </Link>
                ) : (
                  <span className="block truncate text-muted-foreground">Anonymous</span>
                )}
                <div className="text-xs text-muted-foreground">
                  Lv {p.level} • {Number(p.best_wpm).toFixed(0)} WPM • {p.current_streak}d streak
                </div>
              </div>
            </Card>
          ),
      )}
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <Card className="mt-6 border-dashed border-border/60 bg-surface/30 p-12 text-center text-sm text-muted-foreground">
      {message}
    </Card>
  );
}
