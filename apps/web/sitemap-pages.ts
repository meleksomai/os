import { readFileSync } from "node:fs";
import type { tanstackStart } from "@tanstack/react-start/plugin/vite";

type StartOptions = NonNullable<Parameters<typeof tanstackStart>[0]>;
type Page = NonNullable<StartOptions["pages"]>[number];

/**
 * The site's pages for TanStack Start's sitemap (`tanstackStart({ sitemap,
 * pages })` in vite.config.ts, written to dist/client/sitemap.xml at build
 * time). Start only discovers pages by prerendering, which this site does not
 * do, so the list is explicit: the three static pages, plus one entry per
 * essay from the content collection's `onSuccess` hook (so
 * `pnpm run generate:content` runs before Vite loads its config).
 */
export function sitemapPages(): Page[] {
  const { essays } = JSON.parse(
    readFileSync(
      new URL(".content-collections/sitemap.json", import.meta.url),
      "utf8"
    )
  ) as { essays: Array<{ slug: string; publishedAt: string }> };

  return [
    { path: "/" },
    { path: "/essays" },
    { path: "/papers" },
    ...essays.map((essay) => ({
      path: `/essay/${essay.slug}`,
      sitemap: { lastmod: essay.publishedAt },
    })),
  ];
}
