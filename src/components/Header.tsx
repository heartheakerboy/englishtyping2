import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  LogOut,
  LayoutDashboard,
  Zap,
  Trophy,
  User as UserIcon,
  Users,
  Award,
  Swords,
  Gamepad2,
  Target,
  Shield,
  Newspaper,
  Sparkles,
  Menu,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NotificationsBell } from "@/components/NotificationsBell";
import { useServerFn } from "@tanstack/react-start";
import { amIAdmin } from "@/lib/admin.functions";
import { TypingTestsMenu } from "@/components/TypingTestsMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const router = useRouter();
  const { t } = useTranslation("nav");
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminFn = useServerFn(amIAdmin);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setEmail(data.session?.user.email ?? null);
      setUserId(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s);
      setEmail(s?.user.email ?? null);
      setUserId(s?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authed) {
      setIsAdmin(false);
      return;
    }
    adminFn()
      .then((v: any) => setIsAdmin(!!v))
      .catch(() => setIsAdmin(false));
  }, [authed, adminFn]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  const navLink =
    "hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground sm:inline-flex";
  const navActive = {
    className:
      "hidden sm:inline-flex rounded-md px-3 py-2 text-sm font-medium text-foreground bg-surface",
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 md:px-6 h-16 max-w-7xl">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-primary shadow-glow transition-transform group-hover:scale-105">
            <Keyboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-base font-semibold tracking-tight">
              englishtypingtest
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              .org
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {/* Desktop Navigation Links */}
          <Link to="/test" className={navLink} activeProps={navActive}>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              {t("practice")}
            </span>
          </Link>
          <div className="hidden sm:inline-flex">
            <TypingTestsMenu />
          </div>
          <Link to="/race" className={navLink} activeProps={navActive}>
            <span className="inline-flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5" />
              {t("race")}
            </span>
          </Link>
          <Link to="/games" className={navLink} activeProps={navActive}>
            <span className="inline-flex items-center gap-1.5">
              <Gamepad2 className="h-3.5 w-3.5" />
              {t("games")}
            </span>
          </Link>
          <Link to="/tournaments" className={navLink} activeProps={navActive}>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              {t("tournaments")}
            </span>
          </Link>
          <Link to="/leaderboard" className={navLink} activeProps={navActive}>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              {t("leaderboard")}
            </span>
          </Link>
          <Link to="/blog" className={navLink} activeProps={navActive}>
            <span className="inline-flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5" />
              {t("blog")}
            </span>
          </Link>
          <Link to="/templates" className={navLink} activeProps={navActive}>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {t("templates")}
            </span>
          </Link>
          {authed && (
            <Link to="/dashboard" className={navLink} activeProps={navActive}>
              <span className="inline-flex items-center gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {t("dashboard")}
              </span>
            </Link>
          )}
          {authed && (
            <Link to={"/builder" as any} className={navLink} activeProps={navActive}>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {t("builder")}
              </span>
            </Link>
          )}

          {/* Mobile Navigation Drawer (Hamburger Menu) */}
          <div className="inline-flex sm:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Toggle Menu"
                  className="px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] bg-background/95 backdrop-blur-md p-6"
              >
                <SheetHeader>
                  <SheetTitle className="text-left font-display text-lg font-bold text-foreground">
                    Menu Navigation
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Link
                    to="/test"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Zap className="h-4 w-4 text-primary" />
                    {t("practice")}
                  </Link>
                  <Link
                    to="/race"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Swords className="h-4 w-4 text-primary" />
                    {t("race")}
                  </Link>
                  <Link
                    to="/games"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Gamepad2 className="h-4 w-4 text-primary" />
                    {t("games")}
                  </Link>
                  <Link
                    to="/tournaments"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Trophy className="h-4 w-4 text-primary" />
                    {t("tournaments")}
                  </Link>
                  <Link
                    to="/leaderboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Trophy className="h-4 w-4 text-primary" />
                    {t("leaderboard")}
                  </Link>
                  <Link
                    to="/blog"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Newspaper className="h-4 w-4 text-primary" />
                    {t("blog")}
                  </Link>
                  <Link
                    to="/templates"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t("templates")}
                  </Link>
                  {authed && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      {t("dashboard")}
                    </Link>
                  )}
                  {authed && (
                    <Link
                      to={"/builder" as any}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                      {t("builder")}
                    </Link>
                  )}

                  {!authed && (
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/60">
                      <Button
                        variant="outline"
                        asChild
                        className="w-full justify-center"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Link to="/auth">{t("signIn")}</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full justify-center bg-gradient-primary text-primary-foreground shadow-glow"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Link to="/auth" search={{ mode: "signup" }}>
                          {t("getStarted")}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <LanguageSwitcher />
          <ThemeToggle />
          {authed && userId && <NotificationsBell userId={userId} />}
          {authed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <UserIcon className="h-4 w-4" />{" "}
                  <span className="hidden sm:inline">{email?.split("@")[0] ?? t("account")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserIcon className="h-4 w-4" /> {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/achievements">
                    <Award className="h-4 w-4" /> {t("achievements")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/missions">
                    <Target className="h-4 w-4" /> {t("missions")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/friends">
                    <Users className="h-4 w-4" /> {t("friends")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/leaderboard">
                    <Trophy className="h-4 w-4" /> {t("leaderboard")}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to={"/admin" as any}>
                      <Shield className="h-4 w-4" /> {t("admin")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4" /> {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/auth">{t("signIn")}</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="hidden sm:inline-flex bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("getStarted")}
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
