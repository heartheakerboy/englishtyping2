import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { listPublicRooms, createRoom, joinRoom, quickMatch } from "@/lib/race.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LANGUAGE_LIST } from "@/lib/languages";
import { Zap, Users, Plus, LogIn, Crown, Loader2, Globe, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/race/")({
  head: () => ({
    meta: [
      { title: "Multiplayer Typing Race — englishtypingtest.org" },
      {
        name: "description",
        content:
          "Race against typists worldwide in real time. Public rooms, private rooms, ranked matches and tournaments.",
      },
    ],
  }),
  component: RacePage,
});

function RacePage() {
  const navigate = useNavigate();
  const { t } = useTranslation("race");
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  const { data: rooms, refetch } = useQuery({
    queryKey: ["public-rooms"],
    queryFn: () => listPublicRooms(),
    refetchInterval: 4000,
  });

  const createFn = useServerFn(createRoom);
  const joinFn = useServerFn(joinRoom);
  const matchFn = useServerFn(quickMatch);

  const [code, setCode] = useState("");
  const [name, setName] = useState("My race");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [ranked, setRanked] = useState(false);
  const [language, setLanguage] = useState("english");
  const [wordCount, setWordCount] = useState(40);

  const createMutation = useMutation({
    mutationFn: () =>
      createFn({
        data: { name, visibility, ranked, language, word_count: wordCount, max_players: 6 },
      }),
    onSuccess: (room) => navigate({ to: "/race/$code", params: { code: room.code } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : t("room.cannotStart")),
  });

  const joinMutation = useMutation({
    mutationFn: (c: string) => joinFn({ data: { code: c, spectator: false } }),
    onSuccess: (_d, c) => navigate({ to: "/race/$code", params: { code: c.toUpperCase() } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : t("joinByCode.join")),
  });

  const matchMutation = useMutation({
    mutationFn: (isRanked: boolean) => matchFn({ data: { ranked: isRanked, language: "english" } }),
    onSuccess: (r) => navigate({ to: "/race/$code", params: { code: r.code } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Matchmaking failed"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{t("page.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("page.subtitle")}
          </p>
        </div>

        {/* Quick match */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60 bg-surface/40 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-primary" /> {t("quickMatch.title")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("quickMatch.desc")}</p>
            <div className="mt-4 flex gap-2">
              <Button
                disabled={!authed || matchMutation.isPending}
                onClick={() => matchMutation.mutate(false)}
                className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                {matchMutation.isPending && !matchMutation.variables ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}{" "}
                {t("quickMatch.casual")}
              </Button>
              <Button
                disabled={!authed || matchMutation.isPending}
                onClick={() => matchMutation.mutate(true)}
                variant="outline"
                className="flex-1"
              >
                <Crown className="h-4 w-4" /> {t("quickMatch.ranked")}
              </Button>
            </div>
            {!authed && (
              <p className="mt-2 text-xs text-muted-foreground">
                <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
                  {t("joinByCode.join")}
                </Link>{" "}
                {t("quickMatch.signInPrompt")}
              </p>
            )}
          </Card>

          <Card className="border-border/60 bg-surface/40 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LogIn className="h-4 w-4 text-primary" /> {t("joinByCode.title")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("joinByCode.desc")}</p>
            <div className="mt-4 flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={8}
                className="font-mono uppercase tracking-widest"
              />
              <Button
                disabled={!authed || code.length < 4 || joinMutation.isPending}
                onClick={() => joinMutation.mutate(code)}
              >
                {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("joinByCode.join")}
              </Button>
            </div>
          </Card>

          <Card className="border-border/60 bg-surface/40 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Plus className="h-4 w-4 text-primary" /> {t("createRoom.title")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("createRoom.desc")}</p>
            <div className="mt-3 space-y-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("createRoom.namePlaceholder")}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={visibility}
                  onValueChange={(v) => setVisibility(v as "public" | "private")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <Globe className="mr-1.5 inline h-3.5 w-3.5" /> {t("createRoom.public")}
                    </SelectItem>
                    <SelectItem value="private">
                      <Lock className="mr-1.5 inline h-3.5 w-3.5" /> {t("createRoom.private")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_LIST.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={String(wordCount)} onValueChange={(v) => setWordCount(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[20, 30, 40, 60, 80].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {t("createRoom.words", { n })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3">
                  <Label htmlFor="ranked" className="text-xs">
                    {t("createRoom.ranked")}
                  </Label>
                  <Switch id="ranked" checked={ranked} onCheckedChange={setRanked} />
                </div>
              </div>
              <Button
                disabled={!authed || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}{" "}
                {t("createRoom.create")}
              </Button>
            </div>
          </Card>
        </div>

        {/* Public rooms */}
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{t("publicRooms.title")}</h2>
            <button
              onClick={() => refetch()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t("publicRooms.refresh")}
            </button>
          </div>
          <Card className="border-border/60 bg-surface/40 backdrop-blur">
            {(rooms ?? []).length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">
                {t("publicRooms.empty")}
              </div>
            )}
            <div className="divide-y divide-border/60">
              {(rooms ?? []).map((r) => (
                <Link
                  key={r.id}
                  to="/race/$code"
                  params={{ code: r.code }}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-surface/60"
                >
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {r.code} · {r.language} · {r.ranked ? "ranked" : "casual"}
                    </div>
                  </div>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                    {r.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    <Users className="mr-1 inline h-3.5 w-3.5" />
                    {r.players}/{r.max_players}
                  </span>
                  <Button size="sm" variant="outline">
                    {r.status === "racing" ? t("publicRooms.spectate") : t("publicRooms.join")}
                  </Button>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
