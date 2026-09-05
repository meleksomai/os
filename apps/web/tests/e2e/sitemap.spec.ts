/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { type APIRequestContext, expect, test } from "@playwright/test";
import { essaySlugsOnDisk } from "../essays";

const SITE = "https://www.somai.me";

async function sitemapLocs(request: APIRequestContext) {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  const xml = await response.text();
  expect(xml).toMatch(
    /<urlset xmlns="https?:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/
  );
  return {
    xml,
    locs: [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? ""),
  };
}

test("sitemap.xml lists every page once", async ({ request }) => {
  const { locs } = await sitemapLocs(request);

  expect(new Set(locs).size).toBe(locs.length);
  expect(locs).toContain(`${SITE}/`);
  expect(locs).toContain(`${SITE}/essays`);
  expect(locs).toContain(`${SITE}/papers`);

  const essaySlugs = locs
    .filter((loc) => loc.startsWith(`${SITE}/essay/`))
    .map((loc) => loc.replace(`${SITE}/essay/`, ""))
    .sort();
  expect(essaySlugs).toEqual(essaySlugsOnDisk());
  expect(locs).toHaveLength(3 + essaySlugs.length);
});

test("every sitemap URL resolves on this deployment", async ({ request }) => {
  const { locs } = await sitemapLocs(request);

  for (const loc of locs) {
    const response = await request.get(new URL(loc).pathname);
    expect(response.status(), `${loc} should resolve`).toBe(200);
  }
});

test("every entry carries a lastmod date", async ({ request }) => {
  const { xml } = await sitemapLocs(request);

  const dates = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(
    (m) => m[1] ?? ""
  );
  expect(dates).toHaveLength(12);
  for (const date of dates) {
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
});
