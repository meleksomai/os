# Migration: `apps/web` — Next.js + Vercel → TanStack Start

This document summarizes the in-place migration of the `web` app from Next.js (App Router) on Vercel to **TanStack Start** with a **target-agnostic Node server preset** (Nitro). The app was migrated in place — Next.js was removed, not run in parallel. Scope was limited to `apps/web`, `packages/flags` (portable rewrite), and the `packages/ui` image shim. `apps/emailbot` and `apps/trmnl` were left untouched.

---

## 1. Outcome / Verification Status

**Status: GREEN.** All gates pass.

| Gate | Command | Result |
| --- | --- | --- |
| Install | `pnpm install` | OK (lockfile updated) |
| Build | `pnpm --filter web build` | exit 0 — **20 pages prerendered** (8 essays + 8 `.md` variants + `/`, `/essays`, `/papers`, `/baby`) |
| Typecheck | `pnpm --filter web check-types` (`tsc --noEmit`) | exit 0, clean |
| Tests | `pnpm --filter web test` (`vitest run`) | **46/46 passing** across 4 files |
| Lint | `npx ultracite check` (run from repo root) | exit 0 — `apps/web` + `packages/ui` + `packages/flags` clean (60 files) |

**Runtime smoke test** of the built Node server (`node apps/web/.output/server/index.mjs`) confirmed:

- All HTML pages return 200 (`/`, `/essays`, `/papers`, `/baby`, `/essay/<slug>`).
- Per-essay and static OG routes return `image/png` (fonts inlined into the bundle; per-essay route renders a unique PNG, proving params resolve at runtime).
- `/essay/<slug>.md` **and** `Accept: text/markdown | text/plain` on the canonical URL both return raw markdown (`text/markdown; charset=utf-8`).
- `sitemap.xml` (`application/xml`), `robots.txt` (`text/plain`), and static `/og/baby.png` all serve correctly.
- Unknown essay slugs and unknown routes return 404.

> Note: `npx ultracite check` must be run from the repo root (where `biome.jsonc` lives). Running it from inside `apps/web` fails with "No linter configuration found" — expected for this monorepo, not a defect.

---

## 2. Old → New File & Route Mapping

| Route / Concern | Old (Next.js App Router) | New (TanStack Start) |
| --- | --- | --- |
| Home `/` | `app/(home)/page.tsx` | `src/routes/index.tsx` |
| Essays index `/essays` | `app/(blog)/essays/page.tsx` | `src/routes/essays.tsx` |
| Essay `/essay/$slug` | `app/(blog)/essay/[slug]/page.tsx` | `src/routes/essay.$slug.tsx` |
| Essay raw markdown `/essay/$slug.md` | `app/(blog)/essay/[slug]/md/route.ts` | `src/routes/essay.$slug[.]md.ts` + `src/start.ts` middleware |
| Papers `/papers` | `app/(research)/papers/page.tsx` | `src/routes/papers.tsx` |
| Baby `/baby` | `app/(news)/baby/page.tsx` | `src/routes/baby.tsx` |
| Sitemap | `app/sitemap.ts` | `src/routes/sitemap[.]xml.ts` |
| Robots | `app/robots.ts` | `src/routes/robots[.]txt.ts` |
| Not found | `app/not-found.tsx` | `src/components/not-found.tsx` (root `notFoundComponent`) |
| Root layout / `<html>` shell | `app/layout.tsx` | `src/routes/__root.tsx` (`shellComponent`) |
| Theme provider | `components/providers.tsx` | `src/providers.tsx` (still `next-themes`, framework-agnostic) |
| Home OG image | `app/(home)/opengraph-image.tsx` | `src/routes/og.home[.]png.ts` |
| Essays OG image | `app/(blog)/essays/opengraph-image.tsx` | `src/routes/og.essays[.]png.ts` |
| Essay OG image | `app/(blog)/essay/[slug]/opengraph-image.tsx` | `src/routes/og.essay.$slug[.]png.ts` |
| Papers OG image | `app/(research)/papers/opengraph-image.tsx` | `src/routes/og.papers[.]png.ts` |
| Baby OG (static) | `app/(news)/baby/opengraph-image.png` | `public/og/baby.png` |
| OG renderer | `lib/og.tsx` (`next/og`) | `src/lib/og.tsx` (`@vercel/og`, fonts via `?inline`) |
| Essay data (meta) | `app/(blog)/utils.ts` | `src/lib/essays.ts` (isomorphic, `import.meta.glob`) |
| Essay raw markdown reader | `app/(blog)/utils.ts` / `md/route.ts` | `src/lib/essays.server.ts` (server-only, `?raw` glob) |
| Newsletter action | `actions/newsletter.ts` | `src/lib/newsletter.ts` (`createServerFn`) |
| Wishes actions | `actions/wishes.ts` | `src/lib/wishes.ts` (`createServerFn`) |
| Content negotiation proxy | `proxy.ts` | `src/start.ts` request middleware |
| MDX config | `next.config.mjs` + `@next/mdx` + `mdx-components.tsx` | `vite.config.ts` (`@mdx-js/rollup`) + `src/mdx-components.tsx` |
| Fonts | `next/font/google` | `src/fonts.ts` (`@fontsource-variable/*` side-effect imports) |
| Favicons / icons | `app/favicon.ico`, `app/icon.png`, etc. | `public/favicon.ico`, `public/icon.png`, etc. |
| Vercel flags discovery | `app/.well-known/vercel/flags/route.ts` | **Removed** (no replacement) |
| MDX content | `app/(blog)/_content/*.mdx` | `src/content/essays/*.mdx` |

**Route naming note:** literal-dot routes use the `[.]` escape (`essay.$slug[.]md.ts`, `og.essay.$slug[.]png.ts`, `sitemap[.]xml.ts`, `robots[.]txt.ts`). Ultracite's `useFilenamingConvention` is disabled for `apps/web/src/routes/**` via a scoped `biome.jsonc` override.

---

## 3. What Each Vercel Feature Became

| Vercel feature | Disposition |
| --- | --- |
| `@vercel/analytics` | **Dropped entirely** (no replacement, per spec). |
| `@vercel/speed-insights` | **Dropped entirely.** |
| `@vercel/toolbar` (+ Next plugin) | **Removed.** `packages/flags/components/toolbar.tsx` deleted. |
| Vercel feature flags (`flags` / `@vercel/flags`, `.well-known/vercel`) | **Replaced with a portable env-driven implementation** in `packages/flags`. `createFlag(key, default)` reads `FLAG_<UPPER_SNAKE_KEY>` (e.g. `FLAG_IS_BABY_BORN`, `FLAG_ENABLE_SHARE_WISHES`); only the literal values `"false"` / `"0"` override the default. Behavior preserved: `isBabyBorn` defaults `true`, `enableShareWishes` defaults `true`. No Next/Vercel imports. The `.well-known/vercel` discovery endpoint and `endpoint.ts` were removed. |
| OG image generation (`next/og`, colocated `opengraph-image.tsx`) | **Reimplemented as server routes** (`src/routes/og.*.png.ts`) using `@vercel/og`'s `ImageResponse` (the only sanctioned `@vercel/*` dependency). Fonts (`Geist-Regular.ttf`, `Geist-Bold.ttf`) are imported via Vite `?inline` (base64 baked into the server bundle) so there is no runtime `process.cwd()` fs read. Because TanStack does not auto-wire colocated OG images, each page's `head()` now explicitly references its `/og/*.png` route. |
| `.md` content negotiation (`proxy.ts`) | **Server route + request middleware.** The literal `/essay/<slug>.md` URL is served by `src/routes/essay.$slug[.]md.ts`; the `Accept: text/markdown \| text/plain` branch on the canonical `/essay/<slug>` URL is handled globally in `src/start.ts` (server-route handlers in TanStack Start 1.168.18 do not receive a `next()` to fall through to HTML SSR, so a request middleware was used). Defining `src/start.ts` opts out of Start's automatic CSRF middleware, so `createCsrfMiddleware()` is re-added explicitly to keep the newsletter/wishes server functions protected. |
| `next/image` | **Portable shim** in `packages/ui/src/components/image.tsx` — a thin `<img>` wrapper preserving the `next/image` prop surface (incl. `fill`, with `priority`/`sizes`/`quality` accepted as no-ops). |

---

## 4. Dependency Add / Remove Summary

**`apps/web` removed:** `next`, `@next/mdx`, `@mdx-js/loader`, `@vercel/analytics`, `@vercel/speed-insights`, `@vercel/toolbar`, `@tailwindcss/postcss`.

**`apps/web` added:** `@tanstack/react-router` (1.170.10), `@tanstack/react-start` (1.168.18), `@vercel/og` (0.11.1), `katex` (0.16.25), `@fontsource-variable/geist` + `geist-mono` + `lora` (self-hosted fonts); dev: `vite` (7.3.3), `@vitejs/plugin-react` (**5.1.4 — see risks**), `nitro` (^3 beta), `@mdx-js/rollup` (3.1.1), `@tailwindcss/vite` (4.3.0), `@tanstack/react-router-devtools` (1.167.0).

**`apps/web` kept (framework-agnostic):** `next-themes` (0.4.6), `@mdx-js/react`, rehype/remark plugins, `gray-matter`, `shiki`, `react` 19.2.3.

**Scripts:** `build: next build → vite build`; `dev: next dev --turbopack → vite dev`; `start: next start → node .output/server/index.mjs`.

**`packages/flags`:** removed `next` (peer + dev), `@vercel/toolbar`, `flags`, `zod`, `@workspace/ui`, `react`/`@types/react`. Now dependency-free at runtime (env-driven); added `vitest` for its new unit tests and an `exports` map.

**`turbo.json`:** `.next/**` outputs are kept **additively** alongside `.output/**` and `.nitro/**` (required because `emailbot`/`trmnl` are still Next.js).

---

## 5. Remaining Manual Steps

These are NOT done by this migration and must be completed by the owner before/at production cutover:

1. **Set environment variables on the new host** (same as before, plus optional flag overrides):
   - `RESEND_API_KEY`, `RESEND_SEGMENT_GENERAL` (newsletter).
   - `NTFY_WISHES_ID` (baby-wishes push notifications).
   - Supabase/database credentials used by `@workspace/database`.
   - Optional flag overrides (defaults already match current prod behavior — only set to flip): `FLAG_IS_BABY_BORN`, `FLAG_ENABLE_SHARE_WISHES` (set to `false`/`0` to disable).
2. **Choose and deploy to a host with the Node preset.** The build emits `.output/server/index.mjs`; start with `node .output/server/index.mjs` (or `pnpm --filter web start`). Provision a Node 24+ runtime (`engines.node >= 24`). If you want a non-Node preset later, configure Nitro accordingly and re-verify the OG/`?raw`/`?inline` paths.
3. **DNS / domain cutover off Vercel** — repoint `somai.me` (and any apex/`www`) to the new host once it serves the smoke-tested routes.
4. **Delete the Vercel project** for this app (and remove any `.vercel/` linkage / project settings / env vars stored in the Vercel dashboard) once DNS has cut over and is verified.
5. **Add a CI deploy step** for the new host (build → upload `.output/` → run). Remove the Vercel GitHub integration / deploy hooks for this app from CI.
6. **Optional:** decide whether to keep the Playwright `e2e` config — it points at `:3000`; wire it into CI against the Node server if desired (the e2e suite itself was removed during migration).

---

## 6. Known Risks / Follow-ups

- **`@vitejs/plugin-react` pinned to 5.1.4 (not the latest).** Version 6.0.2 hard-requires Vite 8 (it imports `vite/internal`, causing a fatal config-load error). 5.1.4 supports Vite ^7 and keeps the `vite` 7.3.3 / `vitest` 3.2.4 pins. This is the one CONVENTIONS dependency that did not work as written. Revisit when upgrading to Vite 8.
- **Literal-dot dynamic-route param bug (worked around).** TanStack Router parses the whole `$slug.md` / `$slug.png` segment as a single param (named `slug.md` / `slug.png`), so `params.slug` is `undefined`. Both `essay.$slug[.]md.ts` and `og.essay.$slug[.]png.ts` derive the clean slug from the request pathname via regex instead. The build also prints non-fatal warnings about invalid param names `slug.md` / `slug.png` — these are expected given the workaround. Re-evaluate if a future router release fixes literal-segment param parsing.
- **MDX `?raw` plugin wrapper.** `@mdx-js/rollup` strips the query and would compile `*.mdx?raw` imports; `vite.config.ts` wraps its `transform` to bail on `?raw` ids so Vite's raw loader returns source text (needed for `.md` content negotiation). This is a behavioral coupling to `@mdx-js/rollup` internals — re-verify on MDX major upgrades.
- **Plugin order is load-bearing.** In `vite.config.ts`, `tanstackStart()` must run before `viteReact()`, and the MDX plugin must be `enforce: "pre"` ahead of React. Do not reorder.
- **`@` alias duplicated.** `resolve.alias` (`@` → `src`) in `vite.config.ts` is required in addition to tsconfig paths (tsconfig paths alone were insufficient for Rollup). Keep both in sync.
- **`packages/ui/tsconfig.json` still has Next leftovers** (Next TS plugin, `.next/types` includes, Next-era `@/*` path). `packages/ui` was outside the editable scope (only the image shim could change), so this is flagged for the owner rather than fixed here. Harmless for the build, but should be cleaned up when `packages/ui` is next touched.
- **No analytics replacement.** Per spec, `@vercel/analytics` and `@vercel/speed-insights` were dropped with no substitute. If usage telemetry is still wanted, add a portable solution later.
- **Out-of-scope lint debt unchanged.** 13 pre-existing Ultracite errors remain in `apps/emailbot` / `apps/trmnl` (`noGlobalDirnameFilename`, `organizeImports`, `noNegationElse`). Intentionally left untouched per the scope rule; not part of this migration. `apps/web` + `packages/ui` + `packages/flags` are clean.
- **`/research` sitemap quirk preserved.** `sitemap.xml` still emits a `/research` entry even though the real route is `/papers` — carried over verbatim from the old Next sitemap (do not silently rename).
- **Edge-runtime caveat.** Node `fs`/`process.cwd()` reads were eliminated from the shipped server (essays use `import.meta.glob`; fonts use `?inline`). The `src/routes/sitemap[.]xml.ts` and essay readers now run purely on bundled data, so they are edge-safe; if a future essay util reintroduces `node:fs`, add a comment and re-verify under the chosen preset.
