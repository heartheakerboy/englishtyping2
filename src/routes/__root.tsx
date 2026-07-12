import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode, lazy, Suspense } from "react";

const VisitorAnnouncement = lazy(() => import("@/components/VisitorAnnouncement"));

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@/components/Analytics";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PageViewTracker } from "@/components/PageViewTracker";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { useTranslation } from "react-i18next";
import "@/i18n";

function NotFoundComponent() {
  const { t } = useTranslation("errors");
  const { t: tc } = useTranslation("common");
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold text-gradient">{t("notFound.code")}</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("notFound.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("notFound.description")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
          >
            {tc("actions.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useTranslation("errors");
  const { t: tc } = useTranslation("common");
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">{t("generic.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("generic.description")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90"
          >
            {tc("actions.retry")}
          </button>
          <a
            href="/"
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-elevated"
          >
            {tc("actions.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "google-site-verification", content: "kHRehjzXkf-vr8y7HpQiB5uzuDXDSfosncplUBi_dRs" },
      { name: "theme-color", content: "#0a0a0f", media: "(prefers-color-scheme: dark)" },
      { name: "theme-color", content: "#ffffff", media: "(prefers-color-scheme: light)" },
      { title: "English Typing Test — Measure your typing speed" },
      {
        name: "description",
        content:
          "Free, beautiful typing test platform. Test your WPM, accuracy and CPM. Real-time engine with detailed analytics.",
      },
      { name: "author", content: "englishtypingtest.org" },
      { name: "application-name", content: "English Typing Test" },
      { name: "apple-mobile-web-app-title", content: "TypingTest" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { property: "og:site_name", content: "englishtypingtest.org" },
      { property: "og:title", content: "English Typing Test — Measure your typing speed" },
      {
        property: "og:description",
        content: "Test your WPM, accuracy and CPM. Real-time engine with detailed analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "English Typing Test — Measure your typing speed" },
      {
        name: "twitter:description",
        content: "Test your WPM, accuracy and CPM. Real-time engine with detailed analytics.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/favicon.ico" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ett-theme');var c=document.documentElement.classList;if(t==='light'){c.remove('dark')}else{c.add('dark')}var m=document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/);var l=(m&&m[1])||localStorage.getItem('ett-lang')||(navigator.language||'en').split('-')[0];var s=['en','hi','mr','gu','ta','te','kn','ml','pa','bn','ur','ar','es','fr','de','pt','ru','ja','ko','zh'];if(s.indexOf(l)<0)l='en';document.documentElement.lang=l;document.documentElement.dir=(l==='ar'||l==='ur')?'rtl':'ltr';}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();
  const showFooter = !location.pathname.startsWith("/admin");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <SkipLink />
          <AnnouncementBar />
          <Outlet />
          {showFooter && <Footer />}
          <OfflineBanner />
          <Toaster position="top-center" />
          <Analytics />
          <PageViewTracker />
          <Suspense fallback={null}>
            <VisitorAnnouncement />
          </Suspense>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function SkipLink() {
  const { t } = useTranslation("nav");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      suppressHydrationWarning
    >
      {mounted ? t("skipToContent") : "Skip to content"}
    </a>
  );
}
