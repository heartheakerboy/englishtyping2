# Production Readiness — englishtypingtest.org

A premium typing platform built on TanStack Start + Lovable Cloud (Supabase) + Lovable AI Gateway.

## Architecture

- **Frontend**: TanStack Start v1, React 19, Tailwind v4, shadcn/ui, Framer Motion, Recharts.
- **State**: TanStack Query + Zustand (test config), Supabase realtime channels (races, notifications).
- **Backend**: Supabase Postgres with RLS on every table, `createServerFn` for all app-internal RPC, server routes under `src/routes/api/public/*` reserved for webhooks/cron.
- **Auth**: Email/password + Google OAuth (Lovable Cloud), RBAC via `user_roles` + `has_role()` security-definer function.
- **AI**: Lovable AI Gateway (no user key) — paragraph generator, coach, daily challenge, grammar drills.

## Feature Matrix

| Area         | Highlights                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Engine       | Time / Words / Quote / Code / Custom / AI / Numbers / Symbols, RTL, 11 languages, virtual keyboard with finger guide, 4 layouts |
| Stats        | Live WPM, Net WPM, Raw WPM, accuracy, consistency (CoV), per-character heatmap, WPM-over-time chart                             |
| Progression  | XP, level (sqrt curve), coins, daily/longest streak, achievements unlocked via DB trigger                                       |
| Social       | Public profiles, follows, activity feed, leaderboards (global / country / state / city × daily / weekly / monthly / all-time)   |
| Multiplayer  | Public + private rooms, quick match, spectator mode, tournaments, realtime sync                                                 |
| Games        | Reaction, CPS, Spacebar, Memory, Keyboard Trainer                                                                               |
| Missions     | Daily / weekly / monthly with auto progress + reward claim                                                                      |
| Certificates | PDF (jsPDF) + QR-verified public certificate page                                                                               |
| Admin        | Users / texts / blog / coupons / payments / subscriptions / reports / analytics / settings / SEO dashboard, CSV exports         |
| CMS          | Markdown blog (`marked` + DOMPurify), authors, categories, newsletter                                                           |
| Monetization | Pricing page, Stripe + Razorpay-ready schema, coupons                                                                           |
| SEO          | Per-route `head()`, dynamic `sitemap.xml`, `robots.txt`, JSON-LD on blog posts, canonical/og:url                                |
| Analytics    | Conditional GA / Clarity / Plausible loader                                                                                     |

## Security

- **RLS** enabled on every public table; `GRANT` blocks scoped per migration.
- **RBAC** via `app_role` enum + `user_roles` (separate table — never on profiles).
- **Security-definer functions** (`has_role`, `is_admin`) with `search_path = public` and revoked anon execute.
- **Input validation** with Zod on all server functions; markdown sanitized with DOMPurify.
- **Secrets** managed via Lovable Cloud secret store; never committed to repo.
- **2FA-ready**: Supabase Auth supports TOTP enrollment — enable from Auth Settings when ready.
- **Encryption**: Postgres at rest + TLS in transit (managed).
- **Rate limiting**: no platform primitive yet — apply per-endpoint guards if/when needed.
- **CAPTCHA**: hook Supabase Auth's Turnstile/hCaptcha toggle from Auth Settings.

## Performance

- TanStack Start SSR + edge runtime (Cloudflare Workers).
- Code-split via file-based routing; per-route `head()` keeps payloads lean.
- Recharts charts lazy-mount only on dashboards.
- Avoids `useEffect + fetch` — uses loaders + Suspense queries.
- Theme bootstrapped via inline pre-hydration script (no FOUC).
- Tailwind v4 via Lightning CSS.

## Accessibility

- Single `<main>` per route, semantic landmarks, single `<h1>`.
- All icon-only buttons carry `aria-label`.
- `role="status"` / `aria-live` on offline banner, loading screens, toast.
- Focus-visible rings via shadcn defaults; tap targets ≥ 44px on primary CTAs.
- Color tokens (OKLCH) tested for WCAG AA in both themes.

## PWA

- `public/manifest.webmanifest` + theme-color + apple-touch-icon → installable on mobile.
- Offline detection banner (no service worker — typing engine itself is offline-capable since the corpus is bundled).

## SEO Checklist

- Per-route `<title>` + `meta description` + `og:title/description/url` + `twitter:card`.
- Canonical on leaf routes only.
- `JSON-LD` on blog posts (Article), root (WebSite/Organization).
- `sitemap.xml` server route — dynamic blog post inclusion.
- `robots.txt` allows all; admin routes use `noindex` on race/internal.

## Deployment

Click **Publish** in Lovable. Frontend updates require explicit publish; database migrations and server functions deploy immediately.

### Environment

| Var                                                   | Where                          | Notes                      |
| ----------------------------------------------------- | ------------------------------ | -------------------------- |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`           | server `process.env`           | injected by Lovable Cloud  |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | client `import.meta.env`       | injected by Lovable Cloud  |
| `LOVABLE_API_KEY`                                     | server                         | AI Gateway, managed        |
| `SUPABASE_SERVICE_ROLE_KEY`                           | server-only `.server.ts` files | privileged operations only |

## Documentation

- `README.md` — quickstart and codebase map
- `PRODUCTION.md` — this file
- Inline JSDoc on shared components (`Analytics`, `OfflineBanner`, `EmptyState`, `LoadingScreen`)

## Post-launch Checklist

- [ ] Configure custom domain in Lovable → Project Settings → Domains
- [ ] Add Google Analytics / Plausible IDs in Admin → Settings
- [ ] Generate OG share image (optional — current og tags ship text-only)
- [ ] Enable 2FA (TOTP) from Auth Settings
- [ ] Enable Captcha from Auth Settings if open signups attract spam
- [ ] Seed initial typing texts from Admin → Texts
- [ ] Publish first blog post for SEO juice
