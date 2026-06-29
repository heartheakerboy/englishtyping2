import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { recordPageView } from "@/lib/admin-enterprise.functions";

function getSessionId() {
  if (typeof window === "undefined") return undefined;
  try {
    let id = sessionStorage.getItem("ett-sid");
    if (!id) {
      id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)) + Date.now().toString(36);
      sessionStorage.setItem("ett-sid", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function PageViewTracker() {
  const fn = useServerFn(recordPageView);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (last.current === pathname) return;
    last.current = pathname;
    // best-effort, non-blocking
    fn({
      data: {
        path: pathname,
        referrer: document.referrer || undefined,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
      },
    }).catch(() => {});
  }, [pathname, fn]);
  return null;
}
