import type { EssayListItem } from "@/blog/catalog.server";
import { parsePublishedAt } from "@/lib/date";
import { siteConfig } from "../config/site";

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}

/**
 * Same entry list the Next.js MetadataRoute.Sitemap produced, including the
 * duplicate root URL and the /research entry it has always contained.
 */
export function buildSitemapEntries(
  essays: EssayListItem[],
  now: Date
): SitemapEntry[] {
  const essayEntries = essays.map((essay) => ({
    url: `${siteConfig.url}/essay/${essay.slug}`,
    lastModified: parsePublishedAt(essay.metadata.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/essays`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/research`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...essayEntries,
  ];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function sitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) => `<url>
<loc>${escapeXml(entry.url)}</loc>
<lastmod>${entry.lastModified.toISOString()}</lastmod>
<changefreq>${entry.changeFrequency}</changefreq>
<priority>${entry.priority}</priority>
</url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
