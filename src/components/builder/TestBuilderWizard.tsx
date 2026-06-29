// Test Builder wizard: tabbed form to create/edit a custom typing test.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { saveCustomTest, getMyTest, aiGenerateTestParagraph } from "@/lib/custom-tests.functions";
import { amIAdmin } from "@/lib/admin.functions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Upload, FileText, Copy, Check, Link2 } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

const DURATIONS = [
  { v: 15, l: "15s" },
  { v: 20, l: "20s" },
  { v: 30, l: "30s" },
  { v: 60, l: "1m" },
  { v: 120, l: "2m" },
  { v: 300, l: "5m" },
  { v: 420, l: "7m" },
  { v: 600, l: "10m" },
  { v: 900, l: "15m" },
  { v: 1800, l: "30m" },
  { v: 3600, l: "60m" },
];

type FormState = any;

const DEFAULTS: FormState = {
  name: "",
  description: "",
  category: "general",
  tags: [],
  cover_image_url: "",
  banner_url: "",
  content: "",
  content_source: "paste",
  language: "english",
  duration_seconds: 60,
  difficulty: "medium",
  allow_numbers: true,
  allow_symbols: true,
  allow_punctuation: true,
  allow_capitals: true,
  allow_quotes: true,
  allow_linebreaks: true,
  backspace_mode: "allowed",
  backspace_limit: 0,
  spell_check: false,
  access_type: "public",
  password: "",
  email_whitelist: [],
  attempts_limit: null,
  start_at: null,
  expires_at: null,
  timezone: "UTC",
  auto_close: false,
  leaderboard_enabled: true,
  leaderboard_visibility: "public",
  leaderboard_size: 100,
  certificate_enabled: false,
  cert_min_wpm: 30,
  cert_min_accuracy: 90,
  result_visible_stats: {
    wpm: true,
    accuracy: true,
    mistakes: true,
    heatmap: true,
    graphs: true,
    consistency: true,
    ranking: true,
    certificate: true,
    pdf: true,
  },
  anticheat_flags: {
    tab_switch: true,
    copy_paste: true,
    auto_typer: true,
    macros: true,
    bots: true,
    multi_window: true,
    suspicious_speed: true,
  },
  monetization_enabled: false,
  price_cents: 0,
  currency: "usd",
  slug: "",
  status: "draft",
};

export function TestBuilderWizard({ editId }: { editId?: string }) {
  const router = useRouter();
  const save = useServerFn(saveCustomTest);
  const fetchOne = useServerFn(getMyTest);
  const aiGen = useServerFn(aiGenerateTestParagraph);
  const checkAdmin = useServerFn(amIAdmin);
  const [state, setState] = useState<FormState>(DEFAULTS);
  const [loading, setLoading] = useState(!!editId);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    checkAdmin()
      .then((r) => {
        const admin = !!r.isAdmin;
        setIsAdmin(admin);
        if (!admin && !editId) {
          setState((s: any) => ({ ...s, access_type: "private" }));
        }
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, [editId, checkAdmin]);
  const [aiOpts, setAiOpts] = useState({
    topic: "",
    style: "paragraph",
    words: 80,
    difficulty: "medium",
    language: "english",
    readingLevel: "high_school",
    industry: "",
  });
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!editId) return;
    fetchOne({ data: { id: editId } })
      .then((t: any) => {
        setState({ ...DEFAULTS, ...t, password: "" });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Could not load test");
      });
  }, [editId, fetchOne]);

  const set = (k: string, v: any) => setState((s: any) => ({ ...s, [k]: v }));
  const toggleStat = (k: string) =>
    set("result_visible_stats", {
      ...state.result_visible_stats,
      [k]: !state.result_visible_stats[k],
    });
  const toggleAC = (k: string) =>
    set("anticheat_flags", { ...state.anticheat_flags, [k]: !state.anticheat_flags[k] });

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined" || !state.slug) return "";
    return `${window.location.origin}/test/${state.slug}`;
  }, [state.slug]);

  useEffect(() => {
    if (!publicUrl) {
      setQr(null);
      return;
    }
    QRCode.toDataURL(publicUrl, { width: 200, margin: 1 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [publicUrl]);

  async function handleFileUpload(file: File) {
    const text = await file.text().catch(() => "");
    if (text) {
      set("content", text);
      set("content_source", "txt");
      toast.success("Text imported");
    }
  }

  async function handleAIGenerate() {
    setAiBusy(true);
    try {
      const r: any = await aiGen({ data: aiOpts });
      set("content", r.text);
      set("content_source", "ai");
      toast.success("AI generated content");
    } catch (e: any) {
      toast.error(e.message || "AI generation failed");
    } finally {
      setAiBusy(false);
    }
  }

  async function handleSave(status: "draft" | "published") {
    if (!state.name.trim()) {
      toast.error("Name required");
      return;
    }
    if ((state.content ?? "").length < 10) {
      toast.error("Content must be at least 10 characters");
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...state, id: editId, status };
      // Normalize empty strings to nulls
      ["cover_image_url", "banner_url"].forEach((k) => {
        if (!payload[k]) payload[k] = null;
      });
      ["start_at", "expires_at"].forEach((k) => {
        if (!payload[k]) payload[k] = null;
      });
      if (!payload.password) delete payload.password;
      const saved: any = await save({ data: payload });
      toast.success(status === "published" ? "Published!" : "Saved");
      router.navigate({ to: "/builder" as any });
      void saved;
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function copyLink() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {editId ? "Edit Test" : "Create Test"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Build a professional typing test in minutes — no code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Draft
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="bg-gradient-primary text-primary-foreground"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Publish
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        {/* --- Basics --- */}
        <TabsContent value="basics" className="space-y-4 pt-4">
          <Field label="Test name *">
            <Input
              value={state.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="SSC Typing Practice"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={state.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="What this test is about…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cover image URL">
              <Input
                value={state.cover_image_url ?? ""}
                onChange={(e) => set("cover_image_url", e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <Field label="Banner URL">
              <Input
                value={state.banner_url ?? ""}
                onChange={(e) => set("banner_url", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Input
                value={state.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="exam, hiring, classroom…"
              />
            </Field>
            <Field label="Tags (comma separated)">
              <Input
                value={(state.tags ?? []).join(", ")}
                onChange={(e) =>
                  set(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  )
                }
              />
            </Field>
          </div>
        </TabsContent>

        {/* --- Content --- */}
        <TabsContent value="content" className="space-y-4 pt-4">
          <Tabs defaultValue="paste">
            <TabsList>
              <TabsTrigger value="paste">Paste</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="ai">AI Generate</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="pt-3">
              <Textarea
                value={state.content}
                onChange={(e) => {
                  set("content", e.target.value);
                  set("content_source", "paste");
                }}
                rows={10}
                placeholder="Paste passage text here…"
                className="font-mono"
              />
            </TabsContent>
            <TabsContent value="upload" className="pt-3">
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface p-8 text-sm text-muted-foreground hover:bg-surface-elevated cursor-pointer">
                <Upload className="h-6 w-6" />
                <span>Click to upload a .txt file</span>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                DOCX/PDF: paste extracted text directly for now.
              </p>
              {state.content && (
                <Textarea
                  value={state.content}
                  onChange={(e) => set("content", e.target.value)}
                  rows={6}
                  className="mt-3 font-mono"
                />
              )}
            </TabsContent>
            <TabsContent value="ai" className="pt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Style">
                  <Select
                    value={aiOpts.style}
                    onValueChange={(v) => setAiOpts({ ...aiOpts, style: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["paragraph", "story", "news", "quotes", "code", "government_exam"].map(
                        (v) => (
                          <SelectItem key={v} value={v}>
                            {v.replace("_", " ")}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Difficulty">
                  <Select
                    value={aiOpts.difficulty}
                    onValueChange={(v) => setAiOpts({ ...aiOpts, difficulty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["easy", "medium", "hard", "expert"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reading level">
                  <Select
                    value={aiOpts.readingLevel}
                    onValueChange={(v) => setAiOpts({ ...aiOpts, readingLevel: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["elementary", "middle", "high_school", "college", "professional"].map(
                        (v) => (
                          <SelectItem key={v} value={v}>
                            {v.replace("_", " ")}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Word count">
                  <Input
                    type="number"
                    value={aiOpts.words}
                    onChange={(e) => setAiOpts({ ...aiOpts, words: Number(e.target.value) || 80 })}
                  />
                </Field>
                <Field label="Topic">
                  <Input
                    value={aiOpts.topic}
                    onChange={(e) => setAiOpts({ ...aiOpts, topic: e.target.value })}
                    placeholder="space exploration"
                  />
                </Field>
                <Field label="Industry">
                  <Input
                    value={aiOpts.industry}
                    onChange={(e) => setAiOpts({ ...aiOpts, industry: e.target.value })}
                    placeholder="healthcare, fintech…"
                  />
                </Field>
              </div>
              <Button
                onClick={handleAIGenerate}
                disabled={aiBusy}
                className="bg-gradient-primary text-primary-foreground"
              >
                {aiBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}{" "}
                Generate
              </Button>
              {state.content && (
                <div>
                  <Label className="text-xs">Preview (editable)</Label>
                  <Textarea
                    value={state.content}
                    onChange={(e) => set("content", e.target.value)}
                    rows={8}
                    className="mt-1 font-mono"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
          <p className="text-xs text-muted-foreground">
            <FileText className="inline h-3 w-3" /> {state.content.length} characters ·{" "}
            {state.content.split(/\s+/).filter(Boolean).length} words
          </p>
        </TabsContent>

        {/* --- Settings --- */}
        <TabsContent value="settings" className="space-y-4 pt-4">
          <Field label="Duration">
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => set("duration_seconds", d.v)}
                  className={`rounded-md border px-3 py-1 text-xs ${state.duration_seconds === d.v ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground hover:text-foreground"}`}
                >
                  {d.l}
                </button>
              ))}
              <Input
                type="number"
                value={state.duration_seconds}
                onChange={(e) =>
                  set("duration_seconds", Math.max(10, Number(e.target.value) || 60))
                }
                className="w-28"
              />
            </div>
          </Field>
          <Field label="Difficulty">
            <Select value={state.difficulty} onValueChange={(v) => set("difficulty", v)}>
              <SelectTrigger className="w-full sm:w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["easy", "medium", "hard", "expert", "custom"].map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["allow_numbers", "Numbers"],
              ["allow_symbols", "Symbols"],
              ["allow_punctuation", "Punctuation"],
              ["allow_capitals", "Capital letters"],
              ["allow_quotes", "Quotes"],
              ["allow_linebreaks", "Line breaks"],
            ].map(([k, l]) => (
              <ToggleRow
                key={k as string}
                label={l as string}
                checked={!!state[k as string]}
                onChange={(v) => set(k as string, v)}
              />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Backspace">
              <Select value={state.backspace_mode} onValueChange={(v) => set("backspace_mode", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowed">Allowed</SelectItem>
                  <SelectItem value="not_allowed">Not allowed</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {state.backspace_mode === "limited" && (
              <Field label="Backspace limit">
                <Input
                  type="number"
                  value={state.backspace_limit}
                  onChange={(e) => set("backspace_limit", Number(e.target.value) || 0)}
                />
              </Field>
            )}
            <ToggleRow
              label="Spell check"
              checked={state.spell_check}
              onChange={(v) => set("spell_check", v)}
            />
          </div>
        </TabsContent>

        {/* --- Access --- */}
        <TabsContent value="access" className="space-y-4 pt-4">
          <Field label="Access type">
            <Select value={state.access_type} onValueChange={(v) => set("access_type", v)}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "public",
                  "private",
                  "password",
                  "invite",
                  "email_whitelist",
                  "organization",
                  "classroom",
                ]
                  .filter((v) => isAdmin || v !== "public")
                  .map((v) => (
                    <SelectItem key={v} value={v}>
                      {v.replace("_", " ")}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
          {state.access_type === "password" && (
            <Field label="Password">
              <Input
                type="text"
                value={state.password ?? ""}
                onChange={(e) => set("password", e.target.value)}
                placeholder="leave blank to keep existing"
              />
            </Field>
          )}
          {(state.access_type === "email_whitelist" || state.access_type === "invite") && (
            <Field label="Allowed emails (comma separated)">
              <Textarea
                value={(state.email_whitelist ?? []).join(", ")}
                onChange={(e) =>
                  set(
                    "email_whitelist",
                    e.target.value
                      .split(/[,\n]/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                rows={3}
              />
            </Field>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Attempts limit (blank = unlimited)">
              <Input
                type="number"
                value={state.attempts_limit ?? ""}
                onChange={(e) =>
                  set("attempts_limit", e.target.value ? Number(e.target.value) : null)
                }
              />
            </Field>
            <Field label="Start at">
              <Input
                type="datetime-local"
                value={state.start_at?.slice(0, 16) ?? ""}
                onChange={(e) =>
                  set("start_at", e.target.value ? new Date(e.target.value).toISOString() : null)
                }
              />
            </Field>
            <Field label="Expires at">
              <Input
                type="datetime-local"
                value={state.expires_at?.slice(0, 16) ?? ""}
                onChange={(e) =>
                  set("expires_at", e.target.value ? new Date(e.target.value).toISOString() : null)
                }
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Timezone">
              <Input value={state.timezone} onChange={(e) => set("timezone", e.target.value)} />
            </Field>
            <ToggleRow
              label="Auto close when expired"
              checked={state.auto_close}
              onChange={(v) => set("auto_close", v)}
            />
          </div>
        </TabsContent>

        {/* --- Results --- */}
        <TabsContent value="results" className="space-y-4 pt-4">
          <section>
            <h3 className="font-display text-sm font-semibold mb-2">Leaderboard</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <ToggleRow
                label="Enabled"
                checked={state.leaderboard_enabled}
                onChange={(v) => set("leaderboard_enabled", v)}
              />
              <Field label="Visibility">
                <Select
                  value={state.leaderboard_visibility}
                  onValueChange={(v) => set("leaderboard_visibility", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["public", "private", "friends"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Size">
                <Input
                  type="number"
                  value={state.leaderboard_size}
                  onChange={(e) => set("leaderboard_size", Number(e.target.value) || 100)}
                />
              </Field>
            </div>
          </section>

          <section>
            <h3 className="font-display text-sm font-semibold mb-2">Certificate</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <ToggleRow
                label="Enabled"
                checked={state.certificate_enabled}
                onChange={(v) => set("certificate_enabled", v)}
              />
              <Field label="Min WPM">
                <Input
                  type="number"
                  value={state.cert_min_wpm}
                  onChange={(e) => set("cert_min_wpm", Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="Min accuracy %">
                <Input
                  type="number"
                  value={state.cert_min_accuracy}
                  onChange={(e) => set("cert_min_accuracy", Number(e.target.value) || 0)}
                />
              </Field>
            </div>
          </section>

          <section>
            <h3 className="font-display text-sm font-semibold mb-2">Visible result stats</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(state.result_visible_stats).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleStat(k)}
                  className={`rounded-md border px-3 py-1 text-xs ${state.result_visible_stats[k] ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground"}`}
                >
                  {k}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display text-sm font-semibold mb-2">Anti-cheat detection</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(state.anticheat_flags).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleAC(k)}
                  className={`rounded-md border px-3 py-1 text-xs ${state.anticheat_flags[k] ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground"}`}
                >
                  {k.replace("_", " ")}
                </button>
              ))}
            </div>
          </section>
        </TabsContent>

        {/* --- Publish --- */}
        <TabsContent value="publish" className="space-y-4 pt-4">
          <Field label="Custom slug (URL)">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">/test/</span>
              <Input
                value={state.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="my-test"
              />
            </div>
          </Field>

          <section>
            <h3 className="font-display text-sm font-semibold mb-2">Monetization</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <ToggleRow
                label="Charge for entry"
                checked={state.monetization_enabled}
                onChange={(v) => set("monetization_enabled", v)}
              />
              <Field label="Price (cents)">
                <Input
                  type="number"
                  value={state.price_cents}
                  onChange={(e) => set("price_cents", Number(e.target.value) || 0)}
                  disabled={!state.monetization_enabled}
                />
              </Field>
              <Field label="Currency">
                <Input
                  value={state.currency}
                  onChange={(e) => set("currency", e.target.value.toLowerCase())}
                />
              </Field>
            </div>
          </section>

          {publicUrl && (
            <section className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link2 className="h-4 w-4 text-primary" />
                <code className="rounded bg-background px-2 py-1 text-xs">{publicUrl}</code>
                <Button size="sm" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                </Button>
              </div>
              {qr && (
                <img
                  src={qr}
                  alt="QR code"
                  className="mt-3 h-32 w-32 rounded border border-border bg-white p-1"
                />
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <a
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/?text=${encodeURIComponent(publicUrl)}`}
                >
                  WhatsApp
                </a>
                <a
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}`}
                >
                  X
                </a>
                <a
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
                >
                  Facebook
                </a>
                <a
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`}
                >
                  LinkedIn
                </a>
                <a
                  className="text-primary hover:underline"
                  href={`mailto:?subject=Typing Test&body=${encodeURIComponent(publicUrl)}`}
                >
                  Email
                </a>
              </div>
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-muted-foreground">Embed code</summary>
                <pre className="mt-2 overflow-x-auto rounded bg-background p-2 text-[10px]">{`<iframe src="${publicUrl}" width="100%" height="600" frameborder="0"></iframe>`}</pre>
              </details>
            </section>
          )}

          <div className="text-xs text-muted-foreground">
            Status badge: <Badge variant="outline">{state.status}</Badge>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
