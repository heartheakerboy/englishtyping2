// i18next initialization for the multilingual platform.
// - English (`en`) is bundled inline so SSR / first paint never flashes keys.
// - All other languages are lazy-loaded via HTTP from /locales/{lang}/{ns}.json.
// - Detection chain: cookie → localStorage → navigator → "en".
// - Admin DB overrides are merged on top after load (see applyOverrides).
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

import enCommon from "../locales/en/common.json";
import enNav from "../locales/en/nav.json";
import enHome from "../locales/en/home.json";
import enErrors from "../locales/en/errors.json";
import enAuth from "../locales/en/auth.json";
import enFooter from "../locales/en/footer.json";
import enResults from "../locales/en/results.json";
import enConfig from "../locales/en/config.json";
import enGames from "../locales/en/games.json";
import enLoading from "../locales/en/loading.json";

export const LANGUAGE_STORAGE_KEY = "ett-lang";
export const SUPPORTED_LANGS = [
  "en",
  "hi",
  "mr",
  "gu",
  "ta",
  "te",
  "kn",
  "ml",
  "pa",
  "bn",
  "ur",
  "ar",
  "es",
  "fr",
  "de",
  "pt",
  "ru",
  "ja",
  "ko",
  "zh",
] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const RTL_LANGS = new Set<SupportedLang>(["ar", "ur"]);

export const NAMESPACES = [
  "common",
  "nav",
  "home",
  "errors",
  "auth",
  "footer",
  "results",
  "config",
  "games",
  "loading",
] as const;
export type Namespace = (typeof NAMESPACES)[number];

let initialized = false;

export function getI18n() {
  if (initialized) return i18n;
  initialized = true;

  const isBrowser = typeof window !== "undefined";

  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      supportedLngs: SUPPORTED_LANGS as unknown as string[],
      ns: ["common", "nav"],
      defaultNS: "common",
      load: "languageOnly",
      interpolation: { escapeValue: false },
      resources: {
        en: {
          common: enCommon,
          nav: enNav,
          home: enHome,
          errors: enErrors,
          auth: enAuth,
          footer: enFooter,
          results: enResults,
          config: enConfig,
          games: enGames,
          loading: enLoading,
        },
      },
      partialBundledLanguages: true,
      backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
      detection: {
        order: ["cookie", "localStorage", "navigator", "htmlTag"],
        lookupCookie: "lang",
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        caches: isBrowser ? ["localStorage", "cookie"] : [],
        cookieMinutes: 60 * 24 * 365,
      },
      react: { useSuspense: false },
    });

  return i18n;
}

export function isRTL(code: string): boolean {
  return RTL_LANGS.has(code as SupportedLang);
}

/** Apply DB-backed translation overrides on top of bundled JSON. */
export function applyOverrides(
  lang: string,
  rows: Array<{ namespace: string; key: string; value: string }>,
) {
  const grouped: Record<string, Record<string, string>> = {};
  for (const r of rows) {
    (grouped[r.namespace] ??= {})[r.key] = r.value;
  }
  for (const [ns, bundle] of Object.entries(grouped)) {
    i18n.addResourceBundle(lang, ns, bundle, true, true);
  }
}

// Eagerly initialize so `useTranslation()` is ready during SSR + first render.
getI18n();
