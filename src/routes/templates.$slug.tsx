// Per-template SEO + preview page.
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getPublicTemplateBySlug,
  verifyTemplatePassword,
  toggleFavorite,
  reviewTemplate,
  reportTemplate,
  logTemplateUsage,
} from "@/lib/templates.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Star,
  Crown,
  Users,
  Eye,
  Clock,
  Heart,
  Flag,
  Share2,
  Copy,
  Play,
  QrCode,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/templates/$slug")({
  loader: async ({ params }) => {
    const result = await getPublicTemplateBySlug({ data: { slug: params.slug } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ params, loaderData }) => {
    const t = (loaderData as any)?.template;
    if (!t) return { meta: [{ title: "Template" }] };
    const title = t.seo_title || `${t.name} — Typing Template`;
    const description =
      t.seo_description ||
      (t.description
        ? t.description.slice(0, 155)
        : `Free typing template: ${t.name}. Practice and beat the leaderboard.`);
    const image = t.og_image_url || t.banner_url || t.thumbnail_url || undefined;
    const url = `/templates/${params.slug}`;
    const meta: any[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "article" },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
      meta.push({ name: "twitter:card", content: "summary_large_image" });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: t.name,
              headline: title,
              description,
              url,
              image,
              aggregateRating:
                t.rating_count > 0
                  ? {
                      "@type": "AggregateRating",
                      ratingValue: Number(t.rating_avg),
                      ratingCount: t.rating_count,
                      bestRating: 5,
                      worstRating: 1,
                    }
                  : undefined,
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Templates", item: "/templates" },
                ...(t.category_slug
                  ? [
                      {
                        "@type": "ListItem",
                        position: 2,
                        name: t.category_name,
                        item: `/templates?category=${t.category_slug}`,
                      },
                    ]
                  : []),
                { "@type": "ListItem", position: t.category_slug ? 3 : 2, name: t.name, item: url },
              ],
            },
          ]),
        },
      ],
    };
  },
  component: TemplatePage,
});

function TemplatePage() {
  const { template, reviews, tags } = Route.useLoaderData() as any;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState<string | null>(
    template.password_required ? null : template.content_text,
  );
  const [myRating, setMyRating] = useState(5);
  const [myReview, setMyReview] = useState("");
  const [reportReason, setReportReason] = useState("spam");
  const [shareOpen, setShareOpen] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/templates/${template.slug}`
      : `/templates/${template.slug}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;

  const sessionQ = useQuery({
    queryKey: ["auth-session-presence"],
    queryFn: async () => !!(await supabase.auth.getSession()).data.session,
  });
  const signedIn = !!sessionQ.data;

  const favMut = useMutation({
    mutationFn: () => toggleFavorite({ data: { template_id: template.id } }),
    onSuccess: (r) => toast.success(r.favorited ? "Added to favorites" : "Removed from favorites"),
    onError: () => toast.error("Please sign in to favorite."),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      reviewTemplate({ data: { template_id: template.id, rating: myRating, body: myReview } }),
    onSuccess: () => {
      toast.success("Review submitted");
      qc.invalidateQueries({ queryKey: ["template", template.slug] });
      setMyReview("");
    },
    onError: () => toast.error("Please sign in to review."),
  });
  const reportMut = useMutation({
    mutationFn: () => reportTemplate({ data: { template_id: template.id, reason: reportReason } }),
    onSuccess: () => toast.success("Report submitted"),
    onError: () => toast.error("Please sign in to report."),
  });

  const unlockMut = useMutation({
    mutationFn: () => verifyTemplatePassword({ data: { slug: template.slug, password } }),
    onSuccess: (r) => {
      if (r.ok && r.content_text) {
        setUnlocked(r.content_text);
        toast.success("Unlocked");
      } else toast.error("Incorrect password");
    },
  });

  const handleUse = async () => {
    if (signedIn)
      await logTemplateUsage({ data: { template_id: template.id, action: "use" } }).catch(() => {});
    const content = unlocked || template.content_text || "";
    if (!content) {
      toast.error("This template has no content yet.");
      return;
    }
    const { useTestConfig } = await import("@/lib/test-store");
    useTestConfig.getState().set({ mode: "custom", customText: content, category: "general" });
    useTestConfig.getState().regen();

    navigate({ to: "/test" });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const price =
    template.is_premium && template.price_cents > 0
      ? new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: template.currency || "USD",
        }).format(template.price_cents / 100)
      : "Free";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-6">
        <nav className="mb-4 text-xs text-muted-foreground">
          <Link to="/templates" className="hover:text-foreground">
            Templates
          </Link>
          {template.category_slug && (
            <>
              {" "}
              ·{" "}
              <Link
                to="/templates"
                search={{ category: template.category_slug } as any}
                className="hover:text-foreground"
              >
                {template.category_name}
              </Link>
            </>
          )}
          <>
            {" "}
            · <span className="text-foreground">{template.name}</span>
          </>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
          <article>
            {template.banner_url && (
              <div className="mb-6 aspect-[2.4/1] overflow-hidden rounded-xl bg-surface">
                <img
                  src={template.banner_url}
                  alt={template.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{template.difficulty}</Badge>
              <Badge variant="outline">{template.language}</Badge>
              <Badge variant="outline">
                {Math.round(template.duration_seconds / 60) || "<1"} min
              </Badge>
              {template.is_featured && (
                <Badge className="bg-gradient-primary text-primary-foreground">Featured</Badge>
              )}
              {template.is_premium && (
                <Badge className="bg-amber-500/90 text-black gap-1">
                  <Crown className="h-3 w-3" /> {price}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {template.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{template.description}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400" /> {Number(template.rating_avg).toFixed(1)}{" "}
                ({template.rating_count})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {template.uses_count} uses
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {template.views_count} views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {template.duration_seconds}s
              </span>
            </div>

            <Tabs defaultValue="preview" className="mt-8">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4">
                {unlocked === null ? (
                  <Card className="p-6">
                    <h2 className="font-display text-lg font-semibold">Password protected</h2>
                    <p className="text-sm text-muted-foreground">
                      Enter the password to preview the content.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                      />
                      <Button onClick={() => unlockMut.mutate()} disabled={!password}>
                        Unlock
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="max-h-[420px] overflow-auto p-6">
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground/90">
                      {unlocked.slice(0, 1200)}
                      {unlocked.length > 1200 ? "…" : ""}
                    </pre>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <Card className="p-5">
                  <h3 className="font-display font-semibold">Leave a review</h3>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMyRating(n)}
                        aria-label={`Rate ${n} stars`}
                      >
                        <Star
                          className={`h-6 w-6 ${n <= myRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={myReview}
                    onChange={(e) => setMyReview(e.target.value)}
                    placeholder="What did you think?"
                    className="mt-3"
                  />
                  <Button
                    onClick={() => reviewMut.mutate()}
                    className="mt-3"
                    disabled={reviewMut.isPending}
                  >
                    Submit review
                  </Button>
                </Card>
                <div className="mt-4 space-y-3">
                  {reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground">No reviews yet — be the first!</p>
                  )}
                  {reviews.map((r: any) => (
                    <Card key={r.id} className="p-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                      {r.body && <p className="mt-2 text-sm">{r.body}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </article>

          <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            <Card className="space-y-3 p-5">
              <Button
                className="w-full bg-gradient-primary text-primary-foreground"
                size="lg"
                onClick={handleUse}
              >
                <Play className="mr-1 h-4 w-4" /> Use template{" "}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full" onClick={() => favMut.mutate()}>
                <Heart className="mr-1 h-4 w-4" /> Favorite
              </Button>
              <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-1 h-4 w-4" /> Share
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share this template</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-2">
                    <Input readOnly value={shareUrl} />
                    <Button onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid place-items-center pt-2">
                    <img
                      src={qrSrc}
                      alt="QR code"
                      width={220}
                      height={220}
                      className="rounded-lg border border-border bg-white p-2"
                    />
                    <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                      <QrCode className="h-3 w-3" /> Scan to open on another device
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full text-muted-foreground">
                    <Flag className="mr-1 h-4 w-4" /> Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report this template</DialogTitle>
                  </DialogHeader>
                  <Label>Reason</Label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface p-2"
                  >
                    <option value="spam">Spam</option>
                    <option value="copyright">Copyright</option>
                    <option value="offensive">Offensive content</option>
                    <option value="other">Other</option>
                  </select>
                  <Button onClick={() => reportMut.mutate()}>Submit report</Button>
                </DialogContent>
              </Dialog>
            </Card>
            {tags.length > 0 && (
              <Card className="p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t: any) => (
                    <Badge key={t.slug} variant="secondary">
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
