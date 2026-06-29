# englishtypingtest.org

A premium, real-time typing platform — built with TanStack Start, Lovable Cloud, and Lovable AI.

> **Phase complete:** Foundation → Premium polish → AI features → Account system → Multiplayer & gamification → Admin & CMS → **Production polish**.

## Quickstart

```bash
bun install
bun dev          # http://localhost:8080
bun run build    # production build
```

## Stack

- **TanStack Start v1** (React 19, Vite 7) — file-based routing in `src/routes/`
- **Tailwind v4** + **shadcn/ui** — design tokens in `src/styles.css`
- **Lovable Cloud** (Supabase Postgres) — RLS on every table
- **Lovable AI Gateway** — coach, paragraphs, daily challenges
- **Framer Motion**, **Recharts**, **Zustand**, **canvas-confetti**

## Codebase Map

```
src/
  routes/                 file-based router
    __root.tsx            shell + providers
    index.tsx             landing
    test.tsx              typing test runner
    _authenticated/       protected layout (dashboard, profile, admin/*, missions, friends, achievements)
    race.tsx, race.$code  multiplayer
    games.*.tsx           mini-games
    blog.tsx, blog.$slug  CMS
    u.$username.tsx       public profile
    leaderboard.tsx, tournaments.tsx, pricing.tsx, certificate.$id.tsx
    sitemap[.]xml.ts      dynamic sitemap
  components/             shared UI (Header, TypingTest, ResultScreen, MultiplayerRace, etc.)
  lib/                    domain logic + *.functions.ts (server) + *.server.ts (privileged)
  integrations/supabase/  generated client + auth middleware
```

## Key Conventions

- **Server logic**: `createServerFn` in `src/lib/*.functions.ts`. Public webhooks under `src/routes/api/public/*` only.
- **Auth**: `requireSupabaseAuth` middleware exposes `supabase`, `userId`, `claims` on context.
- **RBAC**: `has_role()` security-definer — never check roles client-side.
- **Theming**: semantic tokens (`bg-background`, `text-foreground`) — never hardcode colors.
- **SEO**: per-route `head()` with title/description/og/canonical.

## Production

See [`PRODUCTION.md`](./PRODUCTION.md) for deployment, security, performance, and post-launch checklists.
