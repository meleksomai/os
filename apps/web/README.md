# web — somai.me

The personal website [somai.me](https://www.somai.me), built with [TanStack Start](https://tanstack.com/start) and deployed to [Cloudflare Workers](https://workers.cloudflare.com/).

## Stack

- **[TanStack Start](https://tanstack.com/start)** — full-stack React framework (SSR, server functions, server routes) on Vite.
- **[TanStack Router](https://tanstack.com/router)** — type-safe file-based routing (`src/routes`).
- **[Cloudflare Workers](https://workers.cloudflare.com/)** — runtime and hosting via `@cloudflare/vite-plugin` + Wrangler.
- **[MDX](https://mdxjs.com/)** — essays in `content/*.mdx` compiled with the same remark/rehype pipeline as before (GFM footnotes, TOC, reading time, KaTeX, rehype-pretty-code/Shiki).
- **[Tailwind CSS v4](https://tailwindcss.com/)** + `@workspace/ui` for the design system.
- **[Satori](https://github.com/vercel/satori) + resvg** — Open Graph images pre-generated at build time (`scripts/generate-og.mjs` → `public/og/`).

## Commands

```bash
pnpm dev          # generate OG images + vite dev server on :3000 (workerd runtime)
pnpm build        # generate OG images + production build into dist/
pnpm start        # serve the production build on :4173 (vite preview, workerd)
pnpm test         # vitest unit tests
pnpm e2e          # Playwright tests against the production build (run build first)
pnpm check-types  # tsc
pnpm deploy       # build + wrangler deploy
```

## Environment

Server-side features read these variables (locally from `.dev.vars`, in production from Worker secrets — see `.dev.vars.example`):

| Variable                    | Used by                          |
| --------------------------- | -------------------------------- |
| `RESEND_API_KEY`            | Newsletter subscription (Resend) |
| `RESEND_SEGMENT_GENERAL`    | Resend audience id               |
| `SUPABASE_URL`              | Baby signbook wishes             |
| `SUPABASE_SERVICE_ROLE_KEY` | Baby signbook wishes             |
| `NTFY_WISHES_ID`            | ntfy.sh wish notifications       |

The site renders fully without any of them; the newsletter form reports "Subscription temporarily unavailable" when Resend is not configured.

## Cloudflare deployment

`wrangler.jsonc` defines the Worker (`somai-me`). `vite build` emits the Worker bundle and static assets into `dist/` plus a resolved config at `dist/server/wrangler.json`, and `wrangler deploy` picks it up automatically.

For Cloudflare Workers Builds (git integration):

- **Root directory**: `apps/web`
- **Build command**: `pnpm turbo build --filter=web` (or `pnpm run build`)
- **Deploy command**: `pnpm exec wrangler deploy`

## Route map

| URL                                              | Source                                  |
| ------------------------------------------------ | --------------------------------------- |
| `/`, `/essays`, `/essay/:slug`, `/papers`        | `src/routes/_site.*` (navbar + footer)  |
| `/baby`                                          | `src/routes/baby.tsx`                   |
| `/essay/:slug/md`, `/essay/:slug.md`             | server routes serving raw markdown      |
| `/essay/:slug` with `Accept: text/markdown`      | content negotiation on the essay route  |
| `/sitemap.xml`, `/robots.txt`                    | server routes                           |
| OG images                                        | `/og/*.png` (build-time generated)      |

## Tests

- `src/**/*.test.ts(x)` — unit tests (vitest + jsdom), including regression tests for the essay catalog, raw-markdown rendition, sitemap entries, and SEO meta builder.
- `e2e/*.spec.ts` — Playwright integration/regression suite: page smoke tests, internal link crawl, sitemap/robots, markdown content negotiation, SEO meta + OG image checks, 404s, theme switching, newsletter and signbook flows.
