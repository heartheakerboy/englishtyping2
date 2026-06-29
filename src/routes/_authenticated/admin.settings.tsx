import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPublicSettings, updateSetting } from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const fetcher = useServerFn(getPublicSettings);
  const saver = useServerFn(updateSetting);
  const { data, refetch } = useQuery({ queryKey: ["public-settings"], queryFn: () => fetcher() });
  const [analytics, setAnalytics] = useState({ ga_id: "", clarity_id: "", plausible_domain: "" });
  const [seo, setSeo] = useState({ title: "", description: "" });
  const [features, setFeatures] = useState({ premium_enabled: false, newsletter_enabled: true });

  useEffect(() => {
    if (!data) return;
    setAnalytics({ ga_id: "", clarity_id: "", plausible_domain: "", ...(data.analytics ?? {}) });
    setSeo({ title: "", description: "", ...(data.seo_defaults ?? {}) });
    setFeatures({ premium_enabled: false, newsletter_enabled: true, ...(data.features ?? {}) });
  }, [data]);

  async function save(key: string, value: Record<string, any>) {
    try {
      await saver({ data: { key, value, is_public: true } });
      toast.success("Saved");
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </header>

      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-medium">Analytics</h2>
        <p className="text-xs text-muted-foreground">
          Tracking scripts load automatically when an ID is present.
        </p>
        <Input
          placeholder="Google Analytics measurement ID (G-XXXXX)"
          value={analytics.ga_id}
          onChange={(e) => setAnalytics({ ...analytics, ga_id: e.target.value })}
        />
        <Input
          placeholder="Microsoft Clarity project ID"
          value={analytics.clarity_id}
          onChange={(e) => setAnalytics({ ...analytics, clarity_id: e.target.value })}
        />
        <Input
          placeholder="Plausible domain (e.g. englishtypingtest.org)"
          value={analytics.plausible_domain}
          onChange={(e) => setAnalytics({ ...analytics, plausible_domain: e.target.value })}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={() => save("analytics", analytics)}>
            Save analytics
          </Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-medium">SEO defaults</h2>
        <Input
          placeholder="Default title"
          value={seo.title}
          onChange={(e) => setSeo({ ...seo, title: e.target.value })}
        />
        <Input
          placeholder="Default description"
          value={seo.description}
          onChange={(e) => setSeo({ ...seo, description: e.target.value })}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={() => save("seo_defaults", seo)}>
            Save SEO
          </Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-medium">Feature flags</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.premium_enabled}
            onChange={(e) => setFeatures({ ...features, premium_enabled: e.target.checked })}
          />{" "}
          Premium plans enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={features.newsletter_enabled}
            onChange={(e) => setFeatures({ ...features, newsletter_enabled: e.target.checked })}
          />{" "}
          Newsletter signup visible
        </label>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => save("features", features)}>
            Save features
          </Button>
        </div>
      </Card>
    </div>
  );
}
