import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export const COOKIE_CONSENT_KEY = "ett-cookie-consent";
export type ConsentState = "accepted" | "declined" | null;

export function getCookieConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(value: "accepted" | "declined") {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // storage unavailable — still notify listeners
  }
  window.dispatchEvent(new CustomEvent("ett-cookie-consent", { detail: value }));
}

export function CookieConsent() {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getCookieConsent()) return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const choose = (value: "accepted" | "declined") => {
    setCookieConsent(value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-x-4 bottom-4 z-50 sm:bottom-6"
          role="dialog"
          aria-live="polite"
          aria-label={t("cookieConsent.title", "We value your privacy")}
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-elegant backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-foreground">
                  {t("cookieConsent.title", "We value your privacy")}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(
                    "cookieConsent.message",
                    "We use cookies to improve your experience, analyze site traffic, and serve personalized ads. You can accept or decline non-essential cookies.",
                  )}{" "}
                  <Link
                    to="/cookie-policy"
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    {t("cookieConsent.policy", "Cookie Policy")}
                  </Link>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => choose("declined")}>
                  {t("cookieConsent.decline", "Decline")}
                </Button>
                <Button size="sm" onClick={() => choose("accepted")}>
                  {t("cookieConsent.accept", "Accept all")}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
