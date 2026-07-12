import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { amIAdmin } from "@/lib/admin.functions";
import { Header } from "@/components/Header";
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Globe,
  Flag,
  Award,
  Trophy,
  CreditCard,
  Ticket,
  BarChart3,
  Cog,
  Newspaper,
  Mail,
  Search,
  Image as ImageIcon,
  Megaphone,
  Gamepad2,
  Shield,
  KeyRound,
  ScrollText,
  Sparkles,
  ShieldAlert,
  GitBranchPlus,
  FileBadge,
  Link2,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: any; exact?: boolean };
const SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Content",
    items: [
      { to: "/admin/texts", label: "Typing Texts", icon: FileText },
      { to: "/admin/durations", label: "Test Durations", icon: LayoutDashboard },
      { to: "/admin/custom-tests", label: "Custom Tests", icon: Sparkles },
      { to: "/admin/templates", label: "Templates", icon: FileBadge },
      { to: "/admin/categories", label: "Categories", icon: Tag },
      { to: "/admin/languages", label: "Languages", icon: Globe },
      { to: "/admin/games", label: "Games", icon: Gamepad2 },
      { to: "/admin/blog", label: "Blog", icon: Newspaper },
      { to: "/admin/media", label: "Media Library", icon: ImageIcon },
    ],
  },
  {
    title: "Community",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
      { to: "/admin/leaderboards", label: "Leaderboards", icon: Trophy },
      { to: "/admin/reports", label: "Reports", icon: Flag },
      { to: "/admin/badges", label: "Badges", icon: Sparkles },
    ],
  },
  {
    title: "Revenue",
    items: [
      { to: "/admin/payments", label: "Payments", icon: CreditCard },
      { to: "/admin/coupons", label: "Coupons", icon: Ticket },
      { to: "/admin/ads", label: "Ads", icon: Megaphone },
    ],
  },
  {
    title: "Certificates",
    items: [
      { to: "/admin/certificates", label: "Issued", icon: Award },
      { to: "/admin/cert-templates", label: "Templates", icon: FileBadge },
    ],
  },
  {
    title: "Marketing",
    items: [
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/admin/visitor-banners", label: "Visitor Banners", icon: Megaphone },
      { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { to: "/admin/seo", label: "SEO", icon: Search },
      { to: "/admin/redirects", label: "Redirects", icon: GitBranchPlus },
      { to: "/admin/linking", label: "Linking System", icon: Link2 },
      { to: "/admin/footer", label: "Footer", icon: LayoutDashboard },
      { to: "/admin/legal", label: "Legal Pages", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/admin/settings", label: "Settings", icon: Cog },
      { to: "/admin/cms", label: "CMS", icon: FileText },
      { to: "/admin/audit", label: "Audit & Logs", icon: ScrollText },
      { to: "/admin/apikeys", label: "API Keys", icon: KeyRound },
    ],
  },
];

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const check = useServerFn(amIAdmin);
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    check()
      .then((r) => {
        if (r.isAdmin) {
          setState("ok");
        } else {
          setState("denied");
          navigate({ to: "/dashboard" });
        }
      })
      .catch(() => {
        setState("denied");
        navigate({ to: "/dashboard" });
      });
  }, [check, navigate]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Verifying access…
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Redirecting to dashboard…
      </div>
    );
  }

  const q = filter.toLowerCase();
  const sections = SECTIONS.map((s) => ({
    ...s,
    items: q ? s.items.filter((i) => i.label.toLowerCase().includes(q)) : s.items,
  })).filter((s) => s.items.length);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] flex-1 w-full">
        <aside className="rounded-xl border border-border bg-surface p-2 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="px-2 pb-2">
            <div className="flex items-center gap-2 px-1 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Shield className="h-3.5 w-3.5" /> Admin
            </div>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
              aria-label="Filter navigation"
            />
          </div>
          {sections.map((s) => (
            <div key={s.title} className="px-1 pb-2">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {s.title}
              </div>
              <nav className="flex flex-col gap-0.5">
                {s.items.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to as any}
                    activeOptions={{ exact: n.exact ?? false }}
                    activeProps={{ className: "bg-primary/10 text-primary" }}
                    className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                  >
                    <n.icon className="h-4 w-4" /> {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </aside>
        <main id="main" className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
