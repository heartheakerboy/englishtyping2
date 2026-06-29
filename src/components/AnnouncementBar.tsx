import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getActiveAnnouncement } from "@/lib/admin-enterprise.functions";
import { X } from "lucide-react";

const VARIANT: Record<string, string> = {
  info: "bg-primary/10 text-primary border-primary/30",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  promo: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
};

export function AnnouncementBar() {
  const fn = useServerFn(getActiveAnnouncement);
  const [a, setA] = useState<any>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  useEffect(() => {
    fn()
      .then(setA)
      .catch(() => {});
    try {
      setDismissed(localStorage.getItem("ett-dismissed-ann"));
    } catch {}
  }, [fn]);
  if (!a || dismissed === a.id) return null;
  const cls = VARIANT[a.variant] ?? VARIANT.info;
  return (
    <div className={`border-b text-sm ${cls}`} role="status">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
        {a.href ? (
          <a href={a.href} className="font-medium underline-offset-4 hover:underline">
            {a.message}
          </a>
        ) : (
          <span className="font-medium">{a.message}</span>
        )}
        {a.dismissible ? (
          <button
            onClick={() => {
              try {
                localStorage.setItem("ett-dismissed-ann", a.id);
              } catch {}
              setDismissed(a.id);
            }}
            className="ml-auto rounded p-1 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
