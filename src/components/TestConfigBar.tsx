import React, { useRef, useState } from "react";
import {
  Clock,
  Type as TypeIcon,
  Quote as QuoteIcon,
  BookOpen,
  Code,
  FileText,
  Upload,
  Shuffle,
  Sparkles,
  Keyboard,
  Languages,
  Grid3x3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTestConfig,
  TIME_VALUES,
  WORD_VALUES,
  QUOTE_LENGTHS,
  type TestMode,
} from "@/lib/test-store";
import { LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import { LAYOUT_LIST, type LayoutId } from "@/lib/keyboard-layouts";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateParagraph } from "@/lib/ai.functions";
import { useTranslation } from "react-i18next";

const MODES: { id: TestMode; key: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "time", key: "time", icon: Clock },
  { id: "words", key: "words", icon: TypeIcon },
  { id: "quote", key: "quote", icon: QuoteIcon },
  { id: "paragraph", key: "story", icon: BookOpen },
  { id: "code", key: "code", icon: Code },
  { id: "custom", key: "custom", icon: FileText },
  { id: "ai", key: "ai", icon: Sparkles },
];

export function TestConfigBar({ disabled }: { disabled: boolean }) {
  const cfg = useTestConfig();
  const { t } = useTranslation("config");
  const { mode, timeSeconds, wordCount, quoteLength, customText, set, regen } = cfg;

  return (
    <div className="flex flex-col gap-2">
      <div className="mx-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 p-1.5 text-sm shadow-elegant glass">
        {MODES.map((m) => {
          const label = t(`modes.${m.key}`);
          return (
            <Segment
              key={m.id}
              active={mode === m.id}
              onClick={() => !disabled && set({ mode: m.id })}
              aria-label={label}
            >
              <m.icon className="h-3.5 w-3.5" /> {label}
            </Segment>
          );
        })}

        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

        {mode === "time" && (
          <>
            {TIME_VALUES.map((v) => (
              <Segment
                key={v}
                active={timeSeconds === v}
                onClick={() => !disabled && set({ timeSeconds: v })}
              >
                {formatSeconds(v)}
              </Segment>
            ))}
            <CustomTimerDialog disabled={disabled} />
          </>
        )}

        {mode === "words" &&
          WORD_VALUES.map((v) => (
            <Segment
              key={v}
              active={wordCount === v}
              onClick={() => !disabled && set({ wordCount: v })}
            >
              {v}
            </Segment>
          ))}

        {mode === "quote" &&
          QUOTE_LENGTHS.map((q) => (
            <Segment
              key={q}
              active={quoteLength === q}
              onClick={() => !disabled && set({ quoteLength: q })}
            >
              {q}
            </Segment>
          ))}

        {(mode === "paragraph" || mode === "code" || mode === "quote") && (
          <Segment
            onClick={() => !disabled && regen()}
            active={false}
            aria-label={t("labels.shuffle")}
          >
            <Shuffle className="h-3.5 w-3.5" />
          </Segment>
        )}

        {mode === "custom" && (
          <CustomTextDialog
            disabled={disabled}
            value={customText}
            onSave={(t) => set({ customText: t })}
          />
        )}

        {mode === "ai" && <AIDialog disabled={disabled} />}
      </div>

      {/* Secondary row: language / category / layout / keyboard */}
      <div className="mx-auto flex max-w-full flex-wrap items-center justify-center gap-2 text-xs">
        <LangPicker
          disabled={disabled}
          value={cfg.language}
          onChange={(v) => set({ language: v })}
        />
        <CategoryPicker
          disabled={disabled}
          value={cfg.category}
          onChange={(v) => set({ category: v })}
        />
        <LayoutPicker disabled={disabled} value={cfg.layout} onChange={(v) => set({ layout: v })} />
        <KbdToggle
          show={cfg.showKeyboard}
          onShow={(v) => set({ showKeyboard: v })}
          finger={cfg.showFingerGuide}
          onFinger={(v) => set({ showFingerGuide: v })}
        />
      </div>
    </div>
  );
}

function Segment({
  active,
  onClick,
  children,
  "aria-label": ariaLabel,
}: {
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-glow"
          : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const PillButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(({ children, active, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    {...props}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:bg-surface-elevated hover:text-foreground disabled:opacity-40",
      active && "border-primary/50 bg-primary/10 text-primary",
      className,
    )}
  >
    {children}
  </button>
));
PillButton.displayName = "PillButton";

function LangPicker({
  value,
  onChange,
  disabled,
}: {
  value: LanguageCode;
  onChange: (v: LanguageCode) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation("config");
  const current = LANGUAGE_LIST.find((l) => l.code === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillButton disabled={disabled}>
          <Languages className="h-3 w-3" /> {current?.label}
        </PillButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("labels.language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGE_LIST.map((l) => (
          <DropdownMenuItem key={l.code} onSelect={() => onChange(l.code)}>
            <span
              className={cn(
                "mr-2 inline-block w-2 h-2 rounded-full",
                value === l.code ? "bg-primary" : "bg-transparent border border-border",
              )}
            />
            {l.label} <span className="ml-2 text-muted-foreground">{l.native}</span>
            {l.rtl && <span className="ml-2 text-[10px] uppercase text-primary">RTL</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CategoryPicker({
  value,
  onChange,
  disabled,
}: {
  value: CategoryId;
  onChange: (v: CategoryId) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation("config");
  const current = CATEGORIES.find((c) => c.id === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillButton disabled={disabled}>
          <Grid3x3 className="h-3 w-3" /> {current?.label}
        </PillButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("labels.category")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CATEGORIES.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => onChange(c.id)}>
            <span
              className={cn(
                "mr-2 inline-block w-2 h-2 rounded-full",
                value === c.id ? "bg-primary" : "bg-transparent border border-border",
              )}
            />
            <span>{c.label}</span>
            <span className="ml-2 text-[10px] text-muted-foreground">{c.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LayoutPicker({
  value,
  onChange,
  disabled,
}: {
  value: LayoutId;
  onChange: (v: LayoutId) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation("config");
  const current = LAYOUT_LIST.find((l) => l.id === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillButton disabled={disabled}>
          <Keyboard className="h-3 w-3" /> {current?.label}
        </PillButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("labels.layout")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LAYOUT_LIST.map((l) => (
          <DropdownMenuItem key={l.id} onSelect={() => onChange(l.id)}>
            <span
              className={cn(
                "mr-2 inline-block w-2 h-2 rounded-full",
                value === l.id ? "bg-primary" : "bg-transparent border border-border",
              )}
            />
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function KbdToggle({
  show,
  onShow,
  finger,
  onFinger,
}: {
  show: boolean;
  onShow: (v: boolean) => void;
  finger: boolean;
  onFinger: (v: boolean) => void;
}) {
  const { t } = useTranslation("config");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillButton active={show}>
          <Keyboard className="h-3 w-3" /> {t("labels.keyboard")}
        </PillButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked={show} onCheckedChange={(v) => onShow(!!v)}>
          {t("labels.virtualKeyboard")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={finger} onCheckedChange={(v) => onFinger(!!v)}>
          {t("labels.fingerGuide")}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatSeconds(s: number) {
  if (s < 60) return `${s}s`;
  return `${s / 60}m`;
}

function CustomTimerDialog({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation("config");
  const { t: tc } = useTranslation("common");
  const set = useTestConfig((s) => s.set);
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-40"
        >
          {t("labels.customTimer")}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("customTimer.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="custom-timer">{t("customTimer.seconds")}</Label>
          <Input
            id="custom-timer"
            type="number"
            min={5}
            max={3600}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={t("customTimer.placeholder")}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {tc("actions.cancel")}
          </Button>
          <Button
            onClick={() => {
              const n = Math.round(Number(val));
              if (!Number.isFinite(n) || n < 5 || n > 3600) {
                toast.error(t("customTimer.invalid"));
                return;
              }
              set({ timeSeconds: n });
              setOpen(false);
            }}
          >
            {t("customTimer.apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomTextDialog({
  disabled,
  value,
  onSave,
}: {
  disabled: boolean;
  value: string;
  onSave: (t: string) => void;
}) {
  const { t } = useTranslation("config");
  const { t: tc } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 1024 * 200) {
      toast.error(t("customText.tooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setText(
        String(reader.result ?? "")
          .replace(/\r\n/g, "\n")
          .slice(0, 20000),
      );
    reader.onerror = () => toast.error(t("customText.readFail"));
    reader.readAsText(file);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setText(value);
      }}
    >
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-40"
        >
          {t("labels.editText")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("customText.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("customText.placeholder")}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,text/plain"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> {t("customText.upload")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {t("customText.chars", { count: text.length })}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {tc("actions.cancel")}
          </Button>
          <Button
            onClick={() => {
              if (text.trim().length < 10) {
                toast.error(t("customText.tooShort"));
                return;
              }
              onSave(text.trim());
              setOpen(false);
            }}
          >
            {tc("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AIDialog({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation("config");
  const { t: tc } = useTranslation("common");
  const cfg = useTestConfig();
  const set = useTestConfig((s) => s.set);
  const gen = useServerFn(generateParagraph);
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { text } = await gen({
        data: { language: cfg.language, difficulty, topic: topic || undefined, words: 60 },
      });
      if (!text || text.length < 10) throw new Error(t("ai.empty"));
      set({ aiText: text });
      toast.success(t("ai.success"));
      setOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("ai.failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" /> {t("labels.generate")}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ai.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ai-topic">{t("ai.topic")}</Label>
            <Input
              id="ai-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("ai.topicPlaceholder")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("ai.difficulty")}</Label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "flex-1 rounded-md border border-border px-3 py-1.5 text-xs capitalize transition-colors",
                    difficulty === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-surface",
                  )}
                >
                  {t(`ai.${d}`)}
                </button>
              ))}
            </div>
          </div>
          {cfg.aiText && (
            <div className="rounded-md border border-border bg-surface/50 p-3 font-mono text-xs text-muted-foreground line-clamp-4">
              {cfg.aiText}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {tc("actions.cancel")}
          </Button>
          <Button onClick={run} disabled={loading}>
            {loading ? t("ai.generating") : t("ai.generate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
