import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, Crown, Zap } from "lucide-react";

type Template = {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_url: string | null;
  language: string;
  difficulty: string;
  duration_seconds: number;
  is_featured?: boolean;
  is_premium?: boolean;
  price_cents?: number;
  currency?: string;
  uses_count?: number;
  rating_avg?: number;
  rating_count?: number;
};

export function TemplateCard({ tpl }: { tpl: Template }) {
  const price =
    tpl.is_premium && (tpl.price_cents ?? 0) > 0
      ? new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: tpl.currency || "USD",
        }).format((tpl.price_cents ?? 0) / 100)
      : "Free";
  return (
    <Link to="/templates/$slug" params={{ slug: tpl.slug }} className="group block">
      <Card className="overflow-hidden h-full flex flex-col border-border/60 bg-surface/50 transition-all hover:border-primary/50 hover:shadow-glow">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-transparent">
          {tpl.thumbnail_url ? (
            <img
              src={tpl.thumbnail_url}
              alt={tpl.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center font-display text-3xl font-semibold tracking-tight text-primary/40">
              {tpl.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          {tpl.is_featured && (
            <Badge className="absolute left-2 top-2 gap-1 bg-gradient-primary text-primary-foreground">
              <Zap className="h-3 w-3" /> Featured
            </Badge>
          )}
          {tpl.is_premium && (
            <Badge className="absolute right-2 top-2 gap-1 bg-amber-500/90 text-black">
              <Crown className="h-3 w-3" /> {price}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-display text-base font-semibold">{tpl.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {tpl.description || " "}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px] uppercase">
              {tpl.difficulty}
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase">
              {tpl.language}
            </Badge>
          </div>
          <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.round(tpl.duration_seconds / 60) || "<1"}m
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {tpl.uses_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400" />
              {(tpl.rating_avg ?? 0).toFixed(1)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function TemplateListRow({ tpl }: { tpl: Template }) {
  return (
    <Link to="/templates/$slug" params={{ slug: tpl.slug }}>
      <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/50">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-primary/20 to-transparent">
          {tpl.thumbnail_url ? (
            <img
              src={tpl.thumbnail_url}
              alt={tpl.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center font-display text-xl text-primary/40">
              {tpl.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display font-semibold">{tpl.name}</h3>
            {tpl.is_featured && (
              <Badge className="bg-gradient-primary text-primary-foreground">Featured</Badge>
            )}
            {tpl.is_premium && <Badge className="bg-amber-500/90 text-black">Premium</Badge>}
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">{tpl.description}</p>
        </div>
        <div className="hidden gap-4 text-xs text-muted-foreground md:flex">
          <span>{tpl.difficulty}</span>
          <span>{tpl.language}</span>
          <span>
            <Users className="mr-1 inline h-3 w-3" />
            {tpl.uses_count ?? 0}
          </span>
          <span>
            <Star className="mr-1 inline h-3 w-3 text-amber-400" />
            {(tpl.rating_avg ?? 0).toFixed(1)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
