import { readFileSync } from "node:fs";
import type { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { siteConfig } from "./src/config/site";

type StartOptions = NonNullable<Parameters<typeof tanstackStart>[0]>;
type Page = NonNullable<StartOptions["pages"]>[number];

/**
 * The site's pages for TanStack Start's sitemap (`tanstackStart({ sitemap,
 * pages })`, built into dist/client/sitemap.xml at build time). The essays
 * come from the content collection's `onSuccess` hook, so
 * `pnpm run generate:content` must have run before Vite loads its config.
 */
export function sitemapPages(): Page[] {
  const { essays } = JSON.parse(
    readFileSync(
      new URL(".content-collections/sitemap.json", import.meta.url),
      "utf8"
    )
  ) as { essays: Array<{ slug: string; publishedAt: string }> };

  const newestEssay = essays
    .map((essay) => essay.publishedAt)
    .sort()
    .at(-1);

  return [
    {
      path: "/",
      sitemap: { lastmod: newestEssay, changefreq: "yearly", priority: 1 },
    },
    {
      path: "/essays",
      sitemap: { lastmod: newestEssay, changefreq: "weekly", priority: 0.5 },
    },
    {
      path: "/papers",
      sitemap: { lastmod: newestEssay, changefreq: "monthly", priority: 0.5 },
    },
    ...essays.map((essay) => ({
      path: `/essay/${essay.slug}`,
      sitemap: {
        lastmod: essay.publishedAt,
        changefreq: "monthly" as const,
        priority: 0.4,
      },
    })),
  ];
}

export const sitemapHost = siteConfig.url;
