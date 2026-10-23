import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicSettings } from "@/lib/cms.functions";
import { getCookieConsent, type ConsentState } from "@/components/CookieConsent";

const CONSENT_GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

const CONSENT_DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

/**
 * Analytics loading strategy:
 * - Google Analytics loads for every visitor via Consent Mode v2: consent
 *   defaults to "denied" (cookieless pings only, no personal data) and is
 *   updated to "granted" when the visitor accepts the cookie banner.
 *   This keeps GA4 traffic/modeling working instead of going fully blind
 *   for visitors who never interact with the banner.
 * - Microsoft Clarity (session recording, sets cookies) loads ONLY after
 *   the visitor accepts.
 * - Plausible is cookieless, so it loads without consent.
 */
export function Analytics() {
  const fn = useServerFn(getPublicSettings);
  const [ids, setIds] = useState<{
    ga_id?: string;
    clarity_id?: string;
    plausible_domain?: string;
  } | null>(null);
  const [consent, setConsent] = useState<ConsentState>(() => getCookieConsent());

  useEffect(() => {
    fn()
      .then((s: any) => setIds(s?.analytics ?? {}))
      .catch(() => setIds({}));
  }, [fn]);

  useEffect(() => {
    const handler = (e: Event) => setConsent((e as CustomEvent<ConsentState>).detail ?? null);
    window.addEventListener("ett-cookie-consent", handler);
    return () => window.removeEventListener("ett-cookie-consent", handler);
  }, []);

  // Load GA (consent mode) + Plausible as soon as IDs are known.
  useEffect(() => {
    if (!ids) return;
    const w = window as any;

    if (ids.ga_id && !w.__ettGaLoaded) {
      w.__ettGaLoaded = true;
      const stub = document.createElement("script");
      stub.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',${JSON.stringify(
        CONSENT_DENIED,
      )});`;
      document.head.appendChild(stub);

      const lib = document.createElement("script");
      lib.async = true;
      lib.src = `https://www.googletagmanager.com/gtag/js?id=${ids.ga_id}`;
      document.head.appendChild(lib);

      const cfg = document.createElement("script");
      cfg.text = `gtag('js',new Date());gtag('config','${ids.ga_id}');`;
      document.head.appendChild(cfg);

      // Returning visitor who already accepted earlier:
      if (getCookieConsent() === "accepted" && typeof w.gtag === "function") {
        w.gtag("consent", "update", { ...CONSENT_GRANTED });
      }
    }

    if (ids.plausible_domain && !w.__ettPlausibleLoaded) {
      w.__ettPlausibleLoaded = true;
      const s = document.createElement("script");
      s.defer = true;
      s.setAttribute("data-domain", ids.plausible_domain);
      s.src = "https://plausible.io/js/script.js";
      document.head.appendChild(s);
    }
  }, [ids]);

  // React to consent choices (and apply a stored choice once GA is ready).
  useEffect(() => {
    const w = window as any;
    if (!consent || typeof w.gtag !== "function") return;
    w.gtag("consent", "update", consent === "accepted" ? { ...CONSENT_GRANTED } : { ...CONSENT_DENIED });
  }, [consent, ids]);

  // Clarity only after explicit acceptance.
  useEffect(() => {
    if (!ids?.clarity_id || consent !== "accepted") return;
    const w = window as any;
    if (w.__ettClarityLoaded) return;
    w.__ettClarityLoaded = true;
    const s = document.createElement("script");
    s.text = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${ids.clarity_id}");`;
    document.head.appendChild(s);
  }, [ids, consent]);

  return null;
}
