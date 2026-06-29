import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/cms")({ component: CMSHub });

function CMSHub() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">CMS</h1>
        <p className="text-sm text-muted-foreground">All editable content lives here.</p>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { title: "Blog", desc: "Markdown posts, categories, authors." },
          { title: "Typing Texts", desc: "Curated passages across all languages." },
          { title: "Newsletter", desc: "Subscriber list + CSV export." },
          { title: "Coupons", desc: "Promo codes for premium upgrades." },
          { title: "Categories", desc: "Practice category taxonomy." },
          { title: "Languages", desc: "Supported languages and RTL flags." },
        ].map((c) => (
          <Card key={c.title} className="p-4">
            <div className="text-sm font-medium">{c.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
