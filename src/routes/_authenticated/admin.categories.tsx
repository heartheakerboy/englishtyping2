import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

const PRACTICE = [
  "articles",
  "stories",
  "books",
  "quotes",
  "code",
  "numbers",
  "symbols",
  "government",
  "custom",
];

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Practice Categories</h1>
        <p className="text-sm text-muted-foreground">
          Built-in category taxonomy used across typing tests.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {PRACTICE.map((c) => (
          <Card key={c} className="p-4">
            <div className="text-sm font-medium capitalize">{c}</div>
            <div className="text-xs text-muted-foreground">Edit content via Typing Texts.</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
