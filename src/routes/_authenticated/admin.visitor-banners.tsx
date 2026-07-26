import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  listVisitorBanners,
  upsertVisitorBanner,
  deleteVisitorBanner,
  uploadMedia,
} from "@/lib/admin-enterprise.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { Sparkles, Trash2, ArrowLeft, Upload, Edit, Eye } from "lucide-react";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/_authenticated/admin/visitor-banners")({
  component: VisitorBannersPage,
});

type Banner = {
  id?: string;
  title: string;
  description: string;
  primary_btn_text: string;
  primary_btn_action: string;
  secondary_btn_text: string;
  secondary_btn_href?: string | null;
  colors: {
    bg: string;
    text: string;
    primaryBtnBg: string;
    primaryBtnText: string;
    secondaryBtnBg: string;
    secondaryBtnText: string;
    glassmorphism: boolean;
    border: string;
  };
  image_url?: string | null;
  icon_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  target_audience: "all" | "guests" | "users";
  display_pages: string;
};

const DEFAULT_COLORS = {
  bg: "rgba(10, 10, 15, 0.75)",
  text: "#ffffff",
  primaryBtnBg: "linear-gradient(135deg, #a21caf, #6366f1)",
  primaryBtnText: "#ffffff",
  secondaryBtnBg: "rgba(255, 255, 255, 0.08)",
  secondaryBtnText: "#ffffff",
  glassmorphism: true,
  border: "rgba(255, 255, 255, 0.1)",
};

const DEFAULT_BANNER: Banner = {
  title: "🎉 Welcome to the New EnglishTypingTest.org!",
  description:
    "We've completely rebuilt and upgraded the platform to provide a faster, smarter, and more enjoyable typing experience.\n\n✨ What's New?\n\n✅ Create your FREE account\n✅ Track your typing history and detailed statistics\n✅ Earn XP, Points, Coins, Badges, and Achievements\n✅ Compete on Global Leaderboards\n✅ Play exciting Multiplayer Typing Games\n✅ Unlock Daily Challenges and Rewards\n✅ Access new Typing Tests and Practice Categories\n✅ Get detailed WPM, Accuracy, and Performance Analytics\n✅ Receive Typing Certificates\n✅ Enjoy a faster and more beautiful user experience\n\nCreate your free account today and experience the all-new EnglishTypingTest.org!",
  primary_btn_text: "🚀 Create Free Account",
  primary_btn_action: "signup",
  secondary_btn_text: "Learn More",
  secondary_btn_href: "",
  colors: DEFAULT_COLORS,
  image_url: "",
  icon_url: "",
  starts_at: null,
  ends_at: null,
  is_active: true,
  target_audience: "guests",
  display_pages: "all",
};

function VisitorBannersPage() {
  const list = useServerFn(listVisitorBanners);
  const save = useServerFn(upsertVisitorBanner);
  const del = useServerFn(deleteVisitorBanner);
  const upload = useServerFn(uploadMedia);

  const { data: banners, refetch, isLoading } = useQuery({
    queryKey: ["admin-visitor-banners"],
    queryFn: () => list(),
  });

  const [editorState, setEditorState] = useState<Banner | null>(null);
  const [isUploading, setIsUploading] = useState<"icon" | "image" | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function onSave(b: Banner) {
    try {
      await save({ data: b as any });
      toast.success("Banner saved successfully!");
      setEditorState(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to save banner");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await del({ data: { id } });
      toast.success("Banner deleted");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete banner");
    }
  }

  async function handleFileUpload(file: File, type: "icon" | "image") {
    if (!editorState) return;
    setIsUploading(type);
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const res = await upload({
        data: {
          filename: file.name,
          mime_type: file.type || "application/octet-stream",
          data_base64: b64,
          folder: "banners",
        },
      });
      
      if (!res?.url) {
        throw new Error("No URL returned from file upload");
      }

      setEditorState({
        ...editorState,
        [type === "icon" ? "icon_url" : "image_url"]: res.url,
      });
      toast.success("Uploaded successfully!");
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
    } finally {
      setIsUploading(null);
    }
  }

  const triggerPreviewConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  // Helper to parse description list items beautifully in the preview
  const renderPreviewDescription = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      if (trimmed.startsWith("✅") || trimmed.startsWith("✨") || trimmed.startsWith("🎉") || trimmed.startsWith("🚀")) {
        const emoji = trimmed.slice(0, 2);
        const content = trimmed.slice(2).trim();
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-[13px] text-left">
            <span className="text-base leading-none flex-shrink-0 mt-0.5">{emoji}</span>
            <span className="opacity-95">{content}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-[13px] opacity-90 my-1 leading-relaxed text-left">
          {line}
        </p>
      );
    });
  };

  if (editorState) {
    const cardStyle = {
      backgroundColor: editorState.colors.bg || "rgba(10, 10, 15, 0.8)",
      color: editorState.colors.text || "#ffffff",
      borderColor: editorState.colors.border || "rgba(255, 255, 255, 0.1)",
      backdropFilter: editorState.colors.glassmorphism ? "blur(16px)" : "none",
      WebkitBackdropFilter: editorState.colors.glassmorphism ? "blur(16px)" : "none",
    };

    const primaryBtnStyle = {
      background: editorState.colors.primaryBtnBg || "linear-gradient(135deg, #a21caf, #6366f1)",
      color: editorState.colors.primaryBtnText || "#ffffff",
    };

    const secondaryBtnStyle = {
      backgroundColor: editorState.colors.secondaryBtnBg || "rgba(255, 255, 255, 0.08)",
      color: editorState.colors.secondaryBtnText || "#ffffff",
      borderColor: editorState.colors.border || "rgba(255, 255, 255, 0.1)",
    };

    return (
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setEditorState(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {editorState.id ? "Edit" : "New"} Visitor Banner
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure targeting, schedule, layout and colors.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Editor */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-medium border-b border-border pb-2">Banner Config</h2>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Title</label>
              <Input
                placeholder="Title text"
                value={editorState.title}
                onChange={(e) => setEditorState({ ...editorState, title: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                className="w-full min-h-[160px] rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary scrollbar-thin"
                placeholder="Enter description, supports emojis & lines starting with checkmarks (e.g. ✅ Custom lists)"
                value={editorState.description}
                onChange={(e) => setEditorState({ ...editorState, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium">Primary Button Text</label>
                <Input
                  value={editorState.primary_btn_text}
                  onChange={(e) =>
                    setEditorState({ ...editorState, primary_btn_text: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Primary Button Action</label>
                <select
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                  value={editorState.primary_btn_action}
                  onChange={(e) =>
                    setEditorState({ ...editorState, primary_btn_action: e.target.value })
                  }
                >
                  <option value="signup">Sign Up (Confetti + Redirect)</option>
                  <option value="https://englishtypingtest.org">Custom Link (Enter URL below)</option>
                </select>
                {editorState.primary_btn_action !== "signup" && (
                  <Input
                    className="mt-1"
                    placeholder="https://..."
                    value={editorState.primary_btn_action}
                    onChange={(e) =>
                      setEditorState({ ...editorState, primary_btn_action: e.target.value })
                    }
                  />
                )}
              </div>
            </div>



            {/* Media Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium">Icon URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="URL or Upload"
                    value={editorState.icon_url ?? ""}
                    onChange={(e) => setEditorState({ ...editorState, icon_url: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isUploading !== null}
                    onClick={() => iconInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "icon");
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Banner Image URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="URL or Upload"
                    value={editorState.image_url ?? ""}
                    onChange={(e) => setEditorState({ ...editorState, image_url: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isUploading !== null}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "image");
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Targeting & Scheduling */}
            <div className="border-t border-border pt-4 space-y-4">
              <h3 className="font-medium text-sm">Targeting & Scheduling</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase text-muted-foreground">
                    Audience
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                    value={editorState.target_audience}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        target_audience: e.target.value as any,
                      })
                    }
                  >
                    <option value="guests">Guests Only</option>
                    <option value="users">Logged-In Only</option>
                    <option value="all">Everyone</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase text-muted-foreground">
                    Pages
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                    value={
                      editorState.display_pages === "all" ||
                      editorState.display_pages === "homepage"
                        ? editorState.display_pages
                        : "custom"
                    }
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        display_pages: e.target.value === "custom" ? "" : e.target.value,
                      })
                    }
                  >
                    <option value="all">Entire Website</option>
                    <option value="homepage">Homepage Only</option>
                    <option value="custom">Custom Paths...</option>
                  </select>
                </div>

                {editorState.display_pages !== "all" &&
                  editorState.display_pages !== "homepage" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase text-muted-foreground">
                        Custom Paths (comma-separated)
                      </label>
                      <Input
                        placeholder="/practice,/games"
                        value={editorState.display_pages}
                        onChange={(e) =>
                          setEditorState({ ...editorState, display_pages: e.target.value })
                        }
                      />
                    </div>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase text-muted-foreground">
                    Starts At
                  </label>
                  <Input
                    type="datetime-local"
                    value={editorState.starts_at?.slice(0, 16) ?? ""}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        starts_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase text-muted-foreground">
                    Ends At
                  </label>
                  <Input
                    type="datetime-local"
                    value={editorState.ends_at?.slice(0, 16) ?? ""}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Colors Styling */}
            <div className="border-t border-border pt-4 space-y-4">
              <h3 className="font-medium text-sm">Design & Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">Text Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      className="w-8 h-8 rounded border bg-transparent"
                      value={editorState.colors.text.startsWith("#") ? editorState.colors.text : "#ffffff"}
                      onChange={(e) =>
                        setEditorState({
                          ...editorState,
                          colors: { ...editorState.colors, text: e.target.value },
                        })
                      }
                    />
                    <Input
                      className="h-8 text-xs py-1"
                      value={editorState.colors.text}
                      onChange={(e) =>
                        setEditorState({
                          ...editorState,
                          colors: { ...editorState.colors, text: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">BG (Hex or RGBA)</label>
                  <Input
                    className="h-8 text-xs py-1"
                    value={editorState.colors.bg}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        colors: { ...editorState.colors, bg: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">Border Color</label>
                  <Input
                    className="h-8 text-xs py-1"
                    value={editorState.colors.border}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        colors: { ...editorState.colors, border: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">Glassmorphism</label>
                  <label className="flex items-center gap-2 mt-2 text-sm select-none cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={editorState.colors.glassmorphism}
                      onChange={(e) =>
                        setEditorState({
                          ...editorState,
                          colors: { ...editorState.colors, glassmorphism: e.target.checked },
                        })
                      }
                    />
                    Blur filter
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">
                    Primary Button Background
                  </label>
                  <Input
                    className="h-8 text-xs py-1"
                    placeholder="Hex color or CSS gradient"
                    value={editorState.colors.primaryBtnBg}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        colors: { ...editorState.colors, primaryBtnBg: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">
                    Primary Button Text
                  </label>
                  <Input
                    className="h-8 text-xs py-1"
                    value={editorState.colors.primaryBtnText}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        colors: { ...editorState.colors, primaryBtnText: e.target.value },
                      })
                    }
                  />
                </div>
              </div>


            </div>

            <div className="flex items-center gap-4 border-t border-border pt-4 text-sm">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={editorState.is_active}
                  onChange={(e) => setEditorState({ ...editorState, is_active: e.target.checked })}
                />
                Active (Publish Immediately)
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="ghost" onClick={() => setEditorState(null)}>
                Cancel
              </Button>
              <Button onClick={() => onSave(editorState)}>Save & Publish</Button>
            </div>
          </div>

          {/* Interactive Live Preview */}
          <div className="lg:col-span-5 bg-black/30 border border-border/80 rounded-xl p-6 space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-lg font-medium flex items-center gap-1.5 text-indigo-400">
                <Eye className="h-4 w-4" /> Live Preview
              </h2>
              <span className="text-xs text-muted-foreground">Simulating Desktop View</span>
            </div>

            <div className="w-full border border-border/50 rounded-xl aspect-[4/3] bg-surface-elevated/20 overflow-hidden relative flex items-center justify-center p-4">
              {/* Background Mockup */}
              <div className="absolute inset-0 pointer-events-none select-none opacity-20">
                <div className="absolute top-4 left-4 right-4 h-12 rounded-md bg-white/5 border border-white/5 flex items-center px-4 justify-between">
                  <div className="w-20 h-4 bg-white/20 rounded" />
                  <div className="flex gap-2">
                    <div className="w-8 h-4 bg-white/20 rounded" />
                    <div className="w-8 h-4 bg-white/20 rounded" />
                  </div>
                </div>
                <div className="absolute top-24 left-8 right-8 space-y-2">
                  <div className="w-2/3 h-8 bg-white/20 rounded" />
                  <div className="w-full h-4 bg-white/20 rounded" />
                  <div className="w-5/6 h-4 bg-white/20 rounded" />
                </div>
              </div>

              {/* The Banner */}
              <div
                style={cardStyle}
                className="w-full max-w-[420px] rounded-2xl border p-4 shadow-2xl flex flex-col gap-3 z-10 text-left pointer-events-auto max-h-[90%] overflow-y-auto scrollbar-thin"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {editorState.icon_url ? (
                      <img
                        src={editorState.icon_url}
                        alt="Icon"
                        className="h-8 w-8 rounded-lg object-contain bg-white/5 p-0.5"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm tracking-tight leading-tight">
                      {editorState.title || "No Title Specified"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-1 hover:bg-white/10 opacity-70 cursor-not-allowed"
                    disabled
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Banner Image */}
                {editorState.image_url && (
                  <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-black/10 border border-white/5">
                    <img
                      src={editorState.image_url}
                      alt="Banner Asset"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="flex flex-col gap-0.5 pr-1 max-h-[160px] overflow-y-auto scrollbar-thin">
                  {renderPreviewDescription(editorState.description || "No description provided.")}
                </div>

                {/* Buttons */}
                <div className="flex items-center mt-1">
                  <Button
                    onClick={triggerPreviewConfetti}
                    style={primaryBtnStyle}
                    className="w-full font-medium hover:brightness-110 active:scale-[0.98] transition-all py-1.5 h-auto text-xs rounded-lg border-0"
                  >
                    {editorState.primary_btn_text}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visitor Announcement Banners</h1>
          <p className="text-sm text-muted-foreground">
            Banners shown to guests/first-time visitors to drive accounts and announce updates.
          </p>
        </div>
        <Button onClick={() => setEditorState({ ...DEFAULT_BANNER })}>
          New Visitor Banner
        </Button>
      </header>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">Loading banners...</div>
      ) : (
        <DataTable<Banner & { id: string }>
          rows={(banners ?? []) as any}
          search
          searchFields={["title", "description"]}
          columns={[
            {
              key: "title",
              header: "Banner Title",
              cell: (r) => <span className="font-semibold">{r.title}</span>,
            },
            {
              key: "audience",
              header: "Target",
              cell: (r) => (
                <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium border border-border/80 bg-surface/50 text-muted-foreground">
                  {r.target_audience}
                </span>
              ),
            },
            {
              key: "pages",
              header: "Pages",
              cell: (r) => (
                <span className="text-xs truncate max-w-[120px] inline-block">
                  {r.display_pages}
                </span>
              ),
            },
            {
              key: "active",
              header: "Status",
              cell: (r) => (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.is_active
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"
                  }`}
                >
                  {r.is_active ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              key: "schedule",
              header: "Scheduled Window",
              cell: (r) => (
                <span className="text-xs font-mono">
                  {r.starts_at ? new Date(r.starts_at).toLocaleDateString() : "—"} →{" "}
                  {r.ends_at ? new Date(r.ends_at).toLocaleDateString() : "—"}
                </span>
              ),
            },
          ]}
          actions={(r) => (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditorState(r)}>
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(r.id!)}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          )}
        />
      )}
    </div>
  );
}

// Simple XIcon definition to avoid Radix dependencies in preview
function XIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
