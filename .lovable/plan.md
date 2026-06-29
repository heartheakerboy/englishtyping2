# Multilingual i18n System — Implementation Plan

This is a large, multi-phase build. I'll ship it in 4 phases so each is verifiable in the preview before moving on. Confirm and I'll start Phase 1.

## Architecture

- **Library:** `i18next` + `react-i18next` + `i18next-browser-languagedetector` + `i18next-http-backend`.
  - Industry standard, supports lazy-loading per-language/per-namespace, pluralization, interpolation, formatting.
- **Storage of translations:** JSON files in `public/locales/{lang}/{namespace}.json` (lazy-loaded over HTTP, cacheable) + a DB-backed override table for admin-edited strings (merged on top at load time).
- **Namespaces:** `common`, `nav`, `home`, `test`, `games`, `dashboard`, `admin`, `auth`, `legal`, `blog`, `errors`. Only the namespaces a route needs get loaded.
- **State:**
  - Guest → `localStorage` key `ett-lang` + cookie `lang` (for SSR).
  - Signed-in → `profiles.preferred_language` column; auto-sync on login.
- **RTL:** `dir="rtl"` on `<html>` for `ar`, `ur` via a small `LanguageProvider` effect; Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) used in shared components.
- **SSR:** read cookie in `__root.tsx` head, set `<html lang dir>` server-side; preload the active language's `common` + route namespace via a `<link rel="preload" as="fetch">`.

## Supported Languages (20)

en (default), hi, mr, gu, ta, te, kn, ml, pa, bn, ur, ar, es, fr, de, pt, ru, ja, ko, zh. RTL: ar, ur. New languages = drop a folder under `public/locales/{code}/` + insert a row in `languages` table; zero code changes.

## SEO — Localized URLs

- Add optional `/$lang` prefix route group. Routes stay file-based; a `localizePath(path, lang)` helper produces `/hi/games`, `/ar/dashboard`, etc.
- `__root.tsx` `head()` emits `hreflang` alternates for every enabled language + `x-default`, plus localized `<title>`, `og:title`, `og:description` from the active translation.
- `sitemap.xml.ts` updated to emit one entry per (route × enabled language) with proper `xhtml:link` alternates.
- Canonical = current localized URL.

## Phases

### Phase 1 — Foundation (this turn after approval)

1. Install deps; create `src/i18n/index.ts` with i18next init, detector chain (cookie → localStorage → `navigator.language` → `en`), lazy HTTP backend.
2. Create `LanguageProvider` that sets `<html lang/dir>`, syncs to profile for signed-in users.
3. DB migration: add `languages` table (code, label, native, rtl, enabled, sort), `translations` table (lang, namespace, key, value) for admin overrides, and `profiles.preferred_language` column. Seed 20 languages.
4. Seed `public/locales/en/common.json` + `nav.json` + `home.json` + `errors.json` with all current English strings.
5. Replace hardcoded strings in `Header`, `Footer`, `AnnouncementBar`, `index.tsx`, `404`/error components, `OfflineBanner`, `auth.tsx` with `t('…')`.
6. Add a polished `LanguageSwitcher` component (searchable dropdown, native names, recent + favorites, flag emojis) — mounted in Header (desktop + mobile) and Profile/Settings.

### Phase 2 — Full UI coverage

- Extract strings across `TypingTest`, `TestConfigBar`, `ResultScreen`, `VirtualKeyboard`, dashboard, profile, achievements, friends, missions, leaderboard, certificates, pricing, blog, lessons, templates, builder, all `games.*` routes, race, tournaments.
- Add the corresponding namespace JSON files.
- Translate to all 20 languages (machine translation via Lovable AI Gateway in a one-off seed script writing JSON files; admin can later refine via panel).

### Phase 3 — Admin Translation Manager

- New `/admin/i18n` route:
  - Language list (toggle enabled, add/edit/delete).
  - Translation editor: pick language + namespace, table of key/source/translation, search, filter "missing only", inline edit, save → writes to `translations` table (overrides JSON).
  - Import/Export JSON & CSV per language.
  - Bulk auto-translate via Lovable AI (with review queue).
  - Missing translation report + completion % per language.
  - Version history table + restore (per-key snapshots on save).

### Phase 4 — SEO & Routing

- Add `/$lang` optional segment via a layout route + middleware that detects/redirects.
- Localized `head()` (title/desc/OG) per route using current namespace.
- `hreflang` alternates + x-default in `__root.tsx`.
- Localized `sitemap.xml` with `<xhtml:link>` alternates.
- Localized 404/500 pages.
- Translatable content tables already exist (passages, blog, legal); add `*_translations` companion tables for those + admin UI hooks (Phase 3 reuse).

## Technical Notes

- **No flash of untranslated content:** `__root.tsx` reads the `lang` cookie SSR, sets `<html lang dir>`, and preloads `/locales/{lang}/common.json` before hydration. i18next is initialized synchronously with that bundle inlined into the SSR payload.
- **Bundle impact:** lazy backend → only the active language ships. ~3–8 KB per namespace gzipped.
- **Type safety:** generate `src/i18n/resources.d.ts` from English JSON so `t('nav.home')` is typed.
- **Tests:** snapshot a couple of pages with `lang=ar` to confirm RTL mirroring.

## Out of scope (call out)

- Email + PDF certificate localization will use the same translation tables but require minor renderer updates — included in Phase 2.
- Machine-translated strings for 19 non-English languages will be initial-quality; admin can refine in Phase 3.

Reply "go" to start Phase 1, or tell me what to adjust (e.g. drop a language, skip localized URLs, prioritize admin panel first).
