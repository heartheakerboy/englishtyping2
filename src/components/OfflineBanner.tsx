import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { WifiOff } from "lucide-react";

/** Subtle bottom banner shown when the browser reports offline. */
export function OfflineBanner() {
  const { t } = useTranslation("common");
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-surface/90 px-4 py-2 text-sm text-foreground shadow-lg backdrop-blur animate-fade-in"
    >
      <WifiOff className="h-4 w-4 text-primary" aria-hidden="true" />
      <span className="font-medium">{t("offline.title")}</span>
      <span className="text-muted-foreground">— {t("offline.description")}</span>
    </div>
  );
}
