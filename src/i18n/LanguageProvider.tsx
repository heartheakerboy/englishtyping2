// LanguageProvider — boots i18next on the client, syncs <html lang/dir>,
// merges DB-backed admin overrides, and persists the user's choice to
// localStorage + cookie (guests) and the profiles table (signed-in users).
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { getI18n, isRTL, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGS, type SupportedLang } from "./index";
import { supabase } from "@/integrations/supabase/client";

interface Ctx {
  lang: SupportedLang;
  setLang: (l: SupportedLang) => void;
  recent: SupportedLang[];
  available: SupportedLang[];
}
const LangCtx = createContext<Ctx | null>(null);

const RECENT_KEY = "ett-lang-recent";

function readRecent(): SupportedLang[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return arr.filter((c): c is SupportedLang =>
      (SUPPORTED_LANGS as readonly string[]).includes(c),
    );
  } catch {
    return [];
  }
}

function setCookie(value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `lang=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize i18n once on the client.
  if (typeof window !== "undefined") getI18n();
  const { i18n } = useTranslation();
  const [lang, setLangState] = useState<SupportedLang>(() => {
    const cur = (typeof window !== "undefined" ? i18n.language : "en") || "en";
    const base = cur.split("-")[0];
    return (SUPPORTED_LANGS as readonly string[]).includes(base) ? (base as SupportedLang) : "en";
  });
  const [recent, setRecent] = useState<SupportedLang[]>(readRecent);
  const profileSyncedFor = useRef<string | null>(null);

  // Reflect lang on <html> and persist.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    setCookie(lang);
  }, [lang]);

  // Track recent list.
  useEffect(() => {
    setRecent((prev) => {
      const next = [lang, ...prev.filter((c) => c !== lang)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [lang]);

  // On signed-in user → load preferred_language from profile (once per user).
  useEffect(() => {
    let cancelled = false;
    async function syncFromProfile() {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid || profileSyncedFor.current === uid) return;
      profileSyncedFor.current = uid;
      const { data: prof } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", uid)
        .maybeSingle();
      if (cancelled) return;
      const pref = (prof?.preferred_language || "").split("-")[0];
      if (pref && (SUPPORTED_LANGS as readonly string[]).includes(pref) && pref !== lang) {
        void i18n.changeLanguage(pref);
        setLangState(pref as SupportedLang);
      }
    }
    void syncFromProfile();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      profileSyncedFor.current = null;
      void syncFromProfile();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load DB overrides for the active language (merged on top of bundled JSON).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("translations")
          .select("namespace,key,value")
          .eq("lang", lang);
        if (cancelled || !data?.length) return;
        const { applyOverrides } = await import("./index");
        applyOverrides(lang, data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLang = (l: SupportedLang) => {
    void i18n.changeLanguage(l);
    setLangState(l);
    // Best-effort persist to profile for signed-in users.
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (uid) await supabase.from("profiles").update({ preferred_language: l }).eq("id", uid);
    })();
  };

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      recent,
      available: [...SUPPORTED_LANGS],
    }),
    [lang, recent],
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
