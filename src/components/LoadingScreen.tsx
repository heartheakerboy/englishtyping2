import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

/** Generic shimmer used while route-level data resolves. */
export function LoadingScreen({ label }: { label?: string }) {
  const { t } = useTranslation("loading");
  const text = label ?? t("default");
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{text}</span>
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
