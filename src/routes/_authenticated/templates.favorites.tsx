// User favorites + recently used.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { myFavorites, myRecentlyUsed } from "@/lib/templates.functions";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/templates/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const favs = useQuery({ queryKey: ["my-template-favorites"], queryFn: () => myFavorites() });
  const recents = useQuery({ queryKey: ["my-template-recent"], queryFn: () => myRecentlyUsed() });
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Your library
          </h1>
          <p className="text-sm text-muted-foreground">Favorites and recently used templates.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/templates">Browse marketplace</Link>
        </Button>
      </header>

      <Tabs defaultValue="favorites" className="mt-6">
        <TabsList>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently used</TabsTrigger>
        </TabsList>
        <TabsContent value="favorites" className="mt-4">
          {favs.isLoading ? (
            <Loading />
          ) : (favs.data ?? []).length === 0 ? (
            <Empty hint="Tap the heart on any template to save it here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(favs.data ?? []).map((t: any) => (
                <TemplateCard key={t.id} tpl={t} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="recent" className="mt-4">
          {recents.isLoading ? (
            <Loading />
          ) : (recents.data ?? []).length === 0 ? (
            <Empty hint="Templates you use will appear here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(recents.data ?? []).map((t: any) => (
                <TemplateCard key={t.id} tpl={t} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  );
}
function Empty({ hint }: { hint: string }) {
  return (
    <Card className="grid place-items-center p-12 text-center">
      <Heart className="mb-2 h-8 w-8 text-primary/50" />
      <p className="font-display text-lg">Nothing here yet</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <Button asChild className="mt-4">
        <Link to="/templates">Find templates</Link>
      </Button>
    </Card>
  );
}
