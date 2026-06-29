// Searchable language selector with native names, flags, and a Recently-used
// section. Mount in header (desktop + mobile), profile, settings.
import { useEffect, useMemo, useState } from "react";
import { Check, Globe, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { SupportedLang } from "@/i18n";

interface LangRow {
  code: string;
  label: string;
  native: string;
  rtl: boolean;
  flag: string | null;
  sort_order: number;
}

async function fetchLanguages(): Promise<LangRow[]> {
  const { data, error } = await supabase
    .from("languages")
    .select("code,label,native,rtl,flag,sort_order")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LangRow[];
}

export function LanguageSwitcher({ variant = "icon" }: { variant?: "icon" | "full" }) {
  const { t } = useTranslation("common");
  const { lang, setLang, recent } = useLanguage();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: langs = [] } = useQuery({
    queryKey: ["languages-enabled"],
    queryFn: fetchLanguages,
    staleTime: 5 * 60 * 1000,
  });

  const current = useMemo(() => langs.find((l) => l.code === lang), [langs, lang]);

  const filtered = useMemo(() => {
    if (!q) return langs;
    const needle = q.toLowerCase().trim();
    return langs.filter(
      (l) =>
        l.code.includes(needle) ||
        l.label.toLowerCase().includes(needle) ||
        l.native.toLowerCase().includes(needle),
    );
  }, [langs, q]);

  const recentRows = useMemo(
    () => recent.map((c) => langs.find((l) => l.code === c)).filter(Boolean) as LangRow[],
    [recent, langs],
  );

  function pick(code: string) {
    setLang(code as SupportedLang);
    setOpen(false);
    setQ("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label={t("language.switcher")}
        >
          <Globe className="h-4 w-4" />
          {variant === "full" ? (
            <span className="text-sm">{mounted ? (current?.native ?? lang) : ""}</span>
          ) : (
            <span suppressHydrationWarning className="text-xs font-medium uppercase">
              {mounted ? lang : "en"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b border-border/60 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("language.search")}
              className="h-8 pl-8 text-sm"
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-1">
            {!q && recentRows.length > 1 && (
              <>
                <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("language.recent")}
                </div>
                {recentRows.map((l) => (
                  <LangItem key={`r-${l.code}`} row={l} active={l.code === lang} onPick={pick} />
                ))}
                <div className="my-1 border-t border-border/40" />
              </>
            )}
            {!q && (
              <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("language.all")}
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t("language.noResults")}
              </div>
            ) : (
              filtered.map((l) => (
                <LangItem key={l.code} row={l} active={l.code === lang} onPick={pick} />
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function LangItem({
  row,
  active,
  onPick,
}: {
  row: LangRow;
  active: boolean;
  onPick: (code: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(row.code)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
        active ? "bg-primary/10 text-foreground" : "hover:bg-surface-elevated",
      )}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span className="text-base leading-none">{row.flag || "🌐"}</span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{row.native}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{row.label}</span>
        </span>
      </span>
      {active && <Check className="h-4 w-4 text-primary shrink-0" />}
    </button>
  );
}
