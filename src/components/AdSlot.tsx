import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface AdSlotProps {
  /** Unique key for this ad placement slot */
  slotKey: string;
  /** Responsive ad format: auto (default), horizontal (leaderboard), rectangle (square/box), vertical (skyscraper) */
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  /** Optional specific Google AdSense Slot ID (if created in your AdSense console) */
  slotId?: string;
  /** Google AdSense Publisher ID (defaults to project's official ca-pub-9602707669345879) */
  client?: string;
  /** Additional container styling */
  className?: string;
  /** Custom label above ad (Google policy recommends "ADVERTISEMENT" / "SPONSORED") */
  showLabel?: boolean;
}

const DEFAULT_CLIENT = "ca-pub-9602707669345879";

export function AdSlot({
  slotKey,
  format = "auto",
  slotId,
  client = DEFAULT_CLIENT,
  className,
  showLabel = true,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || pushedRef.current) return;

    try {
      // Check if adsbygoogle is available on window
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      pushedRef.current = true;
      setAdLoaded(true);
    } catch {
      // AdBlock or network block - fallback styling remains graceful
    }
  }, [slotKey]);

  // Dimension helpers for minimal Cumulative Layout Shift (CLS)
  const formatStyles = {
    horizontal: "min-h-[90px] max-w-[970px] w-full",
    rectangle: "min-h-[250px] max-w-[336px] w-full mx-auto",
    vertical: "min-h-[600px] max-w-[300px] w-full",
    auto: "min-h-[100px] w-full",
  }[format];

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot-key={slotKey}
      className={cn(
        "relative my-6 mx-auto flex flex-col items-center justify-center overflow-hidden transition-all duration-300",
        formatStyles,
        className,
      )}
    >
      {showLabel && (
        <div className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 select-none">
          <span className="inline-block h-1 w-1 rounded-full bg-primary/40" />
          Advertisement
          <span className="inline-block h-1 w-1 rounded-full bg-primary/40" />
        </div>
      )}

      <div
        className={cn(
          "relative flex w-full items-center justify-center rounded-xl border border-dashed border-border/50 bg-surface/20 p-2 backdrop-blur-xs transition-colors hover:border-border/80",
          format === "horizontal" && "min-h-[90px]",
          format === "rectangle" && "min-h-[250px]",
          format === "vertical" && "min-h-[600px]",
          format === "auto" && "min-h-[90px] sm:min-h-[100px]",
        )}
      >
        {/* Google AdSense Responsive Unit */}
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={client}
          data-ad-slot={slotId || undefined}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* Fallback & Visual Cue when ad hasn't filled (or in dev/adblock) */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4 text-center opacity-40 select-none">
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            Responsive Ad Space
          </span>
          <span className="rounded-md bg-surface/80 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/70 border border-border/40">
            {slotKey} · {format}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default AdSlot;
