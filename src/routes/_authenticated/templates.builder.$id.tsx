// Template builder wizard — create or edit a template.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  saveTemplate,
  getMyTemplate,
  listCategories,
  generateTemplateFromBrief,
  setTemplateStatus,
  exportTemplateJson,
} from "@/lib/templates.functions";
import {
  Sparkles,
  Wand2,
  Eye,
  Save,
  Send,
  FileDown,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

const paramsSchema = z.object({ id: z.string() });

export const Route = createFileRoute("/_authenticated/templates/builder/$id")({
  parseParams: (raw) => paramsSchema.parse(raw),
  component: TemplateBuilder,
});

type FormState = {
  id?: string;
  name: string;
  description: string;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  category_slug?: string | null;
  tags: string[];
  language: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  duration_seconds: number;
  content_mode: "time" | "words" | "quote" | "code" | "custom";
  content_text: string;
  content_source: "manual" | "ai" | "library";
  ai_prompt?: string | null;
  visibility: "public" | "unlisted" | "private";
  password?: string | null;
  attempt_limit?: number | null;
  certificate_enabled: boolean;
  leaderboard_enabled: boolean;
  leaderboard_scope: "global" | "private" | "off";
  reward_xp: number;
  reward_coins: number;
  is_premium: boolean;
  price_cents: number;
  currency: string;
  discount_percent: number;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
};

const DEFAULTS: FormState = {
  name: "",
  description: "",
  tags: [],
  language: "en",
  difficulty: "medium",
  duration_seconds: 60,
  content_mode: "time",
  content_text: "",
  content_source: "manual",
  visibility: "public",
  certificate_enabled: false,
  leaderboard_enabled: true,
  leaderboard_scope: "global",
  reward_xp: 10,
  reward_coins: 5,
  is_premium: false,
  price_cents: 0,
  currency: "USD",
  discount_percent: 0,
};

const STEPS = ["Basics", "Content", "Settings", "Rewards", "Pricing", "SEO & Publish"];

function TemplateBuilder() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [tagInput, setTagInput] = useState("");
  const [aiBrief, setAiBrief] = useState({ topic: "", purpose: "" });

  const cats = useQuery({ queryKey: ["template-categories"], queryFn: () => listCategories() });
  const existing = useQuery({
    queryKey: ["my-template", id],
    queryFn: () => getMyTemplate({ data: { id } }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (!isNew && existing.data) {
      const t = existing.data as any;
      setForm({
        id: t.id,
        name: t.name ?? "",
        description: t.description ?? "",
        thumbnail_url: t.thumbnail_url,
        banner_url: t.banner_url,
        category_slug: t.category_slug,
        tags: t.tags ?? [],
        language: t.language ?? "en",
        difficulty: t.difficulty ?? "medium",
        duration_seconds: t.duration_seconds ?? 60,
        content_mode: t.content_mode ?? "time",
        content_text: t.content_text ?? "",
        content_source: t.content_source ?? "manual",
        ai_prompt: t.ai_prompt,
        visibility: t.visibility ?? "public",
        attempt_limit: t.attempt_limit,
        certificate_enabled: !!t.certificate_enabled,
        leaderboard_enabled: !!t.leaderboard_enabled,
        leaderboard_scope: t.leaderboard_scope ?? "global",
        reward_xp: t.reward_xp ?? 10,
        reward_coins: t.reward_coins ?? 5,
        is_premium: !!t.is_premium,
        price_cents: t.price_cents ?? 0,
        currency: t.currency ?? "USD",
        discount_percent: t.discount_percent ?? 0,
        seo_title: t.seo_title,
        seo_description: t.seo_description,
        og_image_url: t.og_image_url,
      });
    }
  }, [isNew, existing.data]);

  const save = useMutation({
    mutationFn: () => saveTemplate({ data: form as any }),
    onSuccess: (r: any) => {
      toast.success("Saved");
      if (isNew && r?.id) navigate({ to: "/templates/builder/$id", params: { id: r.id } });
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const publish = useMutation({
    mutationFn: async () => {
      const saved: any = await saveTemplate({ data: form as any });
      const tid = saved?.id ?? form.id;
      if (!tid) throw new Error("Save before publishing");
      return setTemplateStatus({ data: { id: tid, status: "published" } });
    },
    onSuccess: (r: any) =>
      toast.success(r.status === "pending" ? "Submitted for review" : "Published"),
    onError: (e: any) => toast.error(e?.message ?? "Publish failed"),
  });

  const aiGen = useMutation({
    mutationFn: () =>
      generateTemplateFromBrief({
        data: {
          topic: aiBrief.topic,
          purpose: aiBrief.purpose || undefined,
          difficulty: form.difficulty,
          language: form.language,
          duration_seconds: form.duration_seconds,
        },
      }),
    onSuccess: (r: any) => {
      setForm((f) => ({
        ...f,
        name: f.name || r.name,
        description: f.description || r.description,
        content_text: r.content_text,
        content_source: "ai",
        ai_prompt: aiBrief.topic,
        tags: f.tags.length ? f.tags : r.tags,
        seo_title: f.seo_title || r.seo_title,
        seo_description: f.seo_description || r.seo_description,
        reward_xp: f.reward_xp || r.suggested_xp,
        reward_coins: f.reward_coins || r.suggested_coins,
      }));
      toast.success("AI generated the template");
    },
    onError: (e: any) => toast.error(e?.message ?? "AI generation failed"),
  });

  const exportJson = useMutation({
    mutationFn: () => exportTemplateJson({ data: { id: form.id! } }),
    onSuccess: (r) => {
      const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(r as any).slug || "template"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const wordCount = useMemo(
    () => form.content_text.trim().split(/\s+/).filter(Boolean).length,
    [form.content_text],
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (form.tags.includes(t)) return setTagInput("");
    set("tags", [...form.tags, t].slice(0, 15));
    setTagInput("");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <Link
        to="/templates/my"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to my templates
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {isNew ? "Create template" : "Edit template"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Build once. Publish anywhere. Every change is versioned.
          </p>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="outline" onClick={() => exportJson.mutate()}>
              <FileDown className="mr-1 h-4 w-4" /> Export JSON
            </Button>
          )}
          <Button variant="outline" onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="mr-1 h-4 w-4" /> Save draft
          </Button>
          <Button
            onClick={() => publish.mutate()}
            disabled={publish.isPending}
            className="bg-gradient-primary text-primary-foreground"
          >
            <Send className="mr-1 h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <ol className="my-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface/40 p-1">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1 min-w-[120px]">
            <button
              onClick={() => setStep(i)}
              className={`w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors ${step === i ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-surface-elevated"}`}
            >
              <span className="mr-1 inline-grid h-5 w-5 place-items-center rounded-full bg-surface text-[10px]">
                {i + 1}
              </span>
              {s}
            </button>
          </li>
        ))}
      </ol>

      {/* Step body */}
      <Card className="p-5 md:p-6 space-y-4">
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Template name</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. SSC CHSL Typing — 10 minute mock"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="What is this for? Who is it for?"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category_slug ?? "none"}
                onValueChange={(v) => set("category_slug", v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {(cats.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Input
                value={form.language}
                onChange={(e) => set("language", e.target.value)}
                maxLength={8}
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v: any) => set("difficulty", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (seconds)</Label>
              <Input
                type="number"
                min={10}
                max={7200}
                value={form.duration_seconds}
                onChange={(e) => set("duration_seconds", Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      set(
                        "tags",
                        form.tags.filter((x) => x !== t),
                      )
                    }
                  >
                    {t} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
              <div>
                <Label>Thumbnail URL</Label>
                <Input
                  value={form.thumbnail_url ?? ""}
                  onChange={(e) => set("thumbnail_url", e.target.value || null)}
                  placeholder="https://…"
                />
              </div>
              <div>
                <Label>Banner URL</Label>
                <Input
                  value={form.banner_url ?? ""}
                  onChange={(e) => set("banner_url", e.target.value || null)}
                  placeholder="https://…"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wand2 className="h-4 w-4 text-primary" /> Generate with AI
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Describe what you want; we'll write a passage and fill the metadata.
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr,1fr,auto]">
                <Input
                  placeholder="Topic (e.g. Indian Railways history)"
                  value={aiBrief.topic}
                  onChange={(e) => setAiBrief((b) => ({ ...b, topic: e.target.value }))}
                />
                <Input
                  placeholder="Purpose (optional)"
                  value={aiBrief.purpose}
                  onChange={(e) => setAiBrief((b) => ({ ...b, purpose: e.target.value }))}
                />
                <Button onClick={() => aiGen.mutate()} disabled={!aiBrief.topic || aiGen.isPending}>
                  <Sparkles className="mr-1 h-4 w-4" /> Generate
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Content mode</Label>
                <Select
                  value={form.content_mode}
                  onValueChange={(v: any) => set("content_mode", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="words">Words</SelectItem>
                    <SelectItem value="quote">Quote</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right text-xs text-muted-foreground self-end">
                {wordCount} words · {form.content_text.length} chars
              </div>
            </div>
            <div>
              <Label>Typing content</Label>
              <Textarea
                value={form.content_text}
                onChange={(e) => set("content_text", e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Paste or type the passage typists will practice…"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Visibility</Label>
              <Select value={form.visibility} onValueChange={(v: any) => set("visibility", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted (link only)</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Password (optional)</Label>
              <Input
                type="password"
                value={form.password ?? ""}
                onChange={(e) => set("password", e.target.value || null)}
                placeholder="Leave empty for no password"
              />
            </div>
            <div>
              <Label>Attempt limit per user</Label>
              <Input
                type="number"
                min={0}
                value={form.attempt_limit ?? 0}
                onChange={(e) => set("attempt_limit", Number(e.target.value) || null)}
              />
            </div>
            <div>
              <Label>Leaderboard scope</Label>
              <Select
                value={form.leaderboard_scope}
                onValueChange={(v: any) => set("leaderboard_scope", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="private">Private (this template only)</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3 md:col-span-1">
              <div>
                <Label className="text-sm">Enable leaderboard</Label>
                <p className="text-xs text-muted-foreground">Show rankings under the template.</p>
              </div>
              <Switch
                checked={form.leaderboard_enabled}
                onCheckedChange={(v) => set("leaderboard_enabled", !!v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3 md:col-span-1">
              <div>
                <Label className="text-sm">Issue certificates</Label>
                <p className="text-xs text-muted-foreground">
                  Award a downloadable certificate on completion.
                </p>
              </div>
              <Switch
                checked={form.certificate_enabled}
                onCheckedChange={(v) => set("certificate_enabled", !!v)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Reward XP</Label>
              <Input
                type="number"
                min={0}
                value={form.reward_xp}
                onChange={(e) => set("reward_xp", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Reward Coins</Label>
              <Input
                type="number"
                min={0}
                value={form.reward_coins}
                onChange={(e) => set("reward_coins", Number(e.target.value))}
              />
            </div>
            <p className="md:col-span-2 text-xs text-muted-foreground">
              Badges are awarded by admin-defined rules. XP and coins are credited automatically on
              completion.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-border p-3 md:col-span-2">
              <div>
                <Label className="text-sm">Premium template</Label>
                <p className="text-xs text-muted-foreground">
                  Charge a one-time fee or keep it free.
                </p>
              </div>
              <Switch checked={form.is_premium} onCheckedChange={(v) => set("is_premium", !!v)} />
            </div>
            <div>
              <Label>Price (cents)</Label>
              <Input
                type="number"
                min={0}
                disabled={!form.is_premium}
                value={form.price_cents}
                onChange={(e) => set("price_cents", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={form.currency}
                disabled={!form.is_premium}
                onChange={(e) => set("currency", e.target.value.toUpperCase().slice(0, 3))}
              />
            </div>
            <div>
              <Label>Discount (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                disabled={!form.is_premium}
                value={form.discount_percent}
                onChange={(e) => set("discount_percent", Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-4">
            <div>
              <Label>SEO title</Label>
              <Input
                value={form.seo_title ?? ""}
                onChange={(e) => set("seo_title", e.target.value || null)}
                maxLength={160}
                placeholder="Auto-derived from name if empty"
              />
            </div>
            <div>
              <Label>Meta description</Label>
              <Textarea
                value={form.seo_description ?? ""}
                onChange={(e) => set("seo_description", e.target.value || null)}
                maxLength={320}
                rows={3}
              />
            </div>
            <div>
              <Label>Open Graph image URL</Label>
              <Input
                value={form.og_image_url ?? ""}
                onChange={(e) => set("og_image_url", e.target.value || null)}
              />
            </div>
            <div className="rounded-md border border-border bg-surface/50 p-4 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Canonical:</strong> /templates/
                {form.name ? slugifyHint(form.name) : "<auto-slug>"}
              </p>
              <p>Schema.org JSON-LD, OpenGraph and Twitter previews are generated automatically.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => publish.mutate()}
              disabled={publish.isPending}
              className="bg-gradient-primary text-primary-foreground"
            >
              <Send className="mr-1 h-4 w-4" /> Save & publish
            </Button>
          )}
        </div>
      </Card>

      {!isNew && form.id && (
        <Link
          to="/templates/$slug"
          params={{ slug: (existing.data as any)?.slug ?? "" }}
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Eye className="h-4 w-4" /> View public page
        </Link>
      )}
    </div>
  );
}

function slugifyHint(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "template"
  );
}
