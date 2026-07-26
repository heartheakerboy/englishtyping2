import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PrevNextProps {
  prev?: { label: string; to: string };
  next?: { label: string; to: string };
}

// Default items if not provided contextually
const DEFAULT_ITEMS = [
  { label: "Memory Game", to: "/games/memory" },
  { label: "Reaction Time", to: "/games/reaction" },
  { label: "CPS Clicks Test", to: "/games/cps" },
  { label: "Spacebar Test", to: "/games/spacebar" },
  { label: "Keyboard Trainer", to: "/games/trainer" },
  { label: "Type Racer (Bots)", to: "/games/race-bots" },
];

export function PrevNextNavigation({ prev, next }: PrevNextProps) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  const resolved = React.useMemo(() => {
    if (prev || next) return { prev, next };

    // Resolve adjacent from default games list if we are on a game page
    const idx = DEFAULT_ITEMS.findIndex((item) => item.to === currentPath);
    if (idx === -1) return { prev: undefined, next: undefined };

    const prevItem = idx > 0 ? DEFAULT_ITEMS[idx - 1] : DEFAULT_ITEMS[DEFAULT_ITEMS.length - 1];
    const nextItem = idx < DEFAULT_ITEMS.length - 1 ? DEFAULT_ITEMS[idx + 1] : DEFAULT_ITEMS[0];

    return { prev: prevItem, next: nextItem };
  }, [currentPath, prev, next]);

  if (!resolved.prev && !resolved.next) return null;

  return (
    <div className="flex w-full items-center justify-between border-t border-border/40 py-6 mt-10 gap-4">
      {resolved.prev ? (
        <Link
          to={resolved.prev.to}
          className="group flex flex-col items-start gap-1 rounded-xl border border-border/40 bg-surface/20 hover:bg-surface-elevated/40 p-4 transition-all duration-300 w-1/2 max-w-xs"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-3 w-3" /> Previous Game
          </span>
          <span className="text-sm font-semibold text-foreground truncate max-w-full">
            {resolved.prev.label}
          </span>
        </Link>
      ) : (
        <div className="w-1/2" />
      )}

      {resolved.next ? (
        <Link
          to={resolved.next.to}
          className="group flex flex-col items-end gap-1 rounded-xl border border-border/40 bg-surface/20 hover:bg-surface-elevated/40 p-4 transition-all duration-300 w-1/2 max-w-xs text-right"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Next Game <ArrowRight className="h-3 w-3" />
          </span>
          <span className="text-sm font-semibold text-foreground truncate max-w-full">
            {resolved.next.label}
          </span>
        </Link>
      ) : (
        <div className="w-1/2" />
      )}
    </div>
  );
}
