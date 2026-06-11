import { describe, expect, it } from "vitest";
import type { EssayListItem } from "@/blog/catalog.server";
import { buildSitemapEntries, sitemapXml } from "./sitemap";

const NOW = new Date("2026-06-10T00:00:00.000Z");

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

describe("buildSitemapEntries", () => {
  it("matches the entry list of the previous Next.js sitemap", () => {
    const entries = buildSitemapEntries([essay("agents", "2026-01-02")], NOW);

    expect(entries.map((e) => [e.url, e.changeFrequency, e.priority])).toEqual([
      ["https://www.somai.me", "yearly", 1],
      ["https://www.somai.me", "monthly", 0.8],
      ["https://www.somai.me/essays", "weekly", 0.5],
      ["https://www.somai.me/research", "monthly", 0.5],
      ["https://www.somai.me/essay/agents", "monthly", 0.4],
    ]);
  });

  it("uses the essay publish date as lastModified", () => {
    const entries = buildSitemapEntries([essay("agents", "2026-01-02")], NOW);

    expect(entries.at(-1)?.lastModified.toISOString()).toBe(
      "2026-01-02T00:00:00.000Z"
    );
  });
});

describe("sitemapXml", () => {
  it("renders the same XML structure Next.js produced", () => {
    const xml = sitemapXml(buildSitemapEntries([], NOW));

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xml).toContain(`<url>
<loc>https://www.somai.me</loc>
<lastmod>2026-06-10T00:00:00.000Z</lastmod>
<changefreq>yearly</changefreq>
<priority>1</priority>
</url>`);
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });
});
