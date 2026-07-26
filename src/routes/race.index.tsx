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
import { Zap, Users, Plus, LogIn, Crown, Loader2, Globe, Lock, Swords, Trophy, Car, Target, HelpCircle, Keyboard, Gamepad2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SmartLink } from "@/components/ui/SmartLink";

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

        {/* Informational Guide & FAQs */}
        <section className="mt-16 border-t border-border/40 pt-12 max-w-4xl space-y-12">
          {/* Guide content */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
              <Swords className="h-6 w-6 text-primary" />
              Mastering Multiplayer Typing Races: How to Play, Compete, and Win
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Multiplayer Typing Races offer the ultimate test of a typist's speed and composure. While practicing solo on our standard 
              {" "}<SmartLink href="/test" className="text-primary hover:underline font-semibold">free typing test</SmartLink> helps 
              build baseline raw speed, racing against real-world opponents introduces competitive adrenaline. Under real-time pressure, 
              your brain is forced to rely on pure muscle memory rather than conscious key placement—a process known as 
              {" "}<strong>automaticity</strong>.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2 mt-8">
              <div className="space-y-3 p-5 rounded-xl border border-border/50 bg-surface/20 backdrop-blur">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-primary">
                  <Gamepad2 className="h-5 w-5" />
                  Different Ways to Race
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc list-inside">
                  <li>
                    <strong>Quick Match:</strong> Join a public match instantly. Play <span className="text-foreground font-medium">Casual</span> to race risk-free, or <span className="text-foreground font-medium">Ranked</span> to climb the competitive ladder.
                  </li>
                  <li>
                    <strong>Join by Code:</strong> Paste a 6-letter room code from your friends or colleagues to join their private lobby.
                  </li>
                  <li>
                    <strong>Create Room:</strong> Configure a custom room with custom visibility (public/private), custom word count, and multiple language choices.
                  </li>
                </ul>
              </div>

              <div className="space-y-3 p-5 rounded-xl border border-border/50 bg-surface/20 backdrop-blur">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-success">
                  <Target className="h-5 w-5" />
                  Core Rules & Mechanics
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc list-inside">
                  <li>
                    <strong>The Countdown:</strong> A 5-second countdown starts once the lobby launches. Align your fingers and prepare!
                  </li>
                  <li>
                    <strong>Real-time Progress:</strong> Watch your vehicle speed across the track as you type, tracking other players in real-time.
                  </li>
                  <li>
                    <strong>Error Penalty:</strong> Mistyped words are highlighted in red. You must correct errors before you can advance further.
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              To build the skill required for multiplayer victory, we recommend a balanced practice regimen. 
              Start by learning correct finger placement through our interactive {" "}
              <SmartLink href="/lessons" className="text-primary hover:underline font-semibold">typing lessons</SmartLink>. 
              If you aren't quite ready to face human opponents, you can hone your skills in our {" "}
              <SmartLink href="/games/race-bots" className="text-primary hover:underline font-semibold">typing race against bots</SmartLink>. 
              For fun and quick reflexes, browse our full collection of arcade typing games in the {" "}
              <SmartLink href="/games" className="text-primary hover:underline font-semibold">typing games lobby</SmartLink>, including 
              favorites like {" "}<SmartLink href="/games/falling-words" className="text-primary hover:underline">Falling Words</SmartLink> and {" "}
              <SmartLink href="/games/zombie-typing" className="text-primary hover:underline">Zombie Typing</SmartLink>.
            </p>
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  Do I need an account to play multiplayer races?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  While you can view public rooms as a spectator, you must be logged in to participate as a racer or create your own custom rooms. This keeps the environment fair, competitive, and tracks your progress. You can easily sign up via the <SmartLink href="/auth" className="text-primary hover:underline">Authentication page</SmartLink>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  Can I play typing races in other languages besides English?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Yes! When you create a custom room, you can select from a wide range of supported languages (including English, Spanish, German, French, Hindi, and more). Lobbies filter and match based on the chosen language.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  How does Ranked matchmaking work?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Ranked matchmaking pairs you against players of similar typing speeds (WPM). Wins and high-placement finishes will increase your competitive rating and place you higher on the global <SmartLink href="/leaderboard" className="text-primary hover:underline">Leaderboard</SmartLink>, while low finishes will lower it.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary">
                  Why does accuracy matter more than speed in race rooms?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  Because of the strict error correction rule, every typo completely stops your vehicle until it is corrected. High raw speed with low accuracy results in jerky movement and lower overall WPM. Focus on typing smoothly at 96%+ accuracy to maximize your efficiency.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
    </div>
  );
}
