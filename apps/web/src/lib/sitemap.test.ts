import { describe, expect, it } from "vitest";
import type { EssayListItem } from "@/essays/types";
import { buildSitemapEntries, sitemapXml } from "./sitemap";

function essay(slug: string, publishedAt: string): EssayListItem {
  return {
    slug,
    metadata: {
      title: slug,
      subtitle: "subtitle",
      featured: false,
      publishedAt,
      publishedAtFormatted: "formatted",
      category: "engineering",
    },
    readingTime: { text: "1 min read", minutes: 1, time: 60_000, words: 100 },
  };
}

const essays = [essay("agents", "2026-01-02"), essay("okr", "2025-12-15")];

describe("buildSitemapEntries", () => {
  it("matches the entry list of the previous Next.js sitemap", () => {
    const entries = buildSitemapEntries(essays);

    expect(entries.map((e) => [e.url, e.changeFrequency, e.priority])).toEqual([
      ["https://www.somai.me", "yearly", 1],
      ["https://www.somai.me", "monthly", 0.8],
      ["https://www.somai.me/essays", "weekly", 0.5],
      ["https://www.somai.me/research", "monthly", 0.5],
      ["https://www.somai.me/essay/agents", "monthly", 0.4],
      ["https://www.somai.me/essay/okr", "monthly", 0.4],
    ]);
  });

  it("uses each essay's publish date as its lastmod", () => {
    const entries = buildSitemapEntries(essays);

    expect(entries.at(-1)?.lastModified.toISOString()).toBe(
      "2025-12-15T00:00:00.000Z"
    );
  });

  it("dates the static entries by the newest essay", () => {
    const entries = buildSitemapEntries([...essays].reverse());

    for (const entry of entries.slice(0, 4)) {
      expect(entry.lastModified.toISOString()).toBe("2026-01-02T00:00:00.000Z");
    }
  });
});

describe("sitemapXml", () => {
  it("renders the same XML structure Next.js produced", () => {
    const xml = sitemapXml(buildSitemapEntries(essays));

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xml).toContain(`<url>
<loc>https://www.somai.me</loc>
<lastmod>2026-01-02T00:00:00.000Z</lastmod>
<changefreq>yearly</changefreq>
<priority>1</priority>
</url>`);
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });
});
