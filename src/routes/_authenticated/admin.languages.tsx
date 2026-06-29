import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { LANGUAGE_LIST } from "@/lib/languages";

export const Route = createFileRoute("/_authenticated/admin/languages")({
  component: LanguagesPage,
});

function LanguagesPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Languages</h1>
        <p className="text-sm text-muted-foreground">
          {LANGUAGE_LIST.length} languages enabled (with RTL where required).
        </p>
      </header>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Native</th>
              <th className="text-left p-3">Direction</th>
            </tr>
          </thead>
          <tbody>
            {LANGUAGE_LIST.map((l) => (
              <tr key={l.code} className="border-t border-border/40">
                <td className="p-3 font-mono">{l.code}</td>
                <td className="p-3">{l.label}</td>
                <td className="p-3">{l.native}</td>
                <td className="p-3">{l.rtl ? "RTL" : "LTR"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
