/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";
import { essaySlugsOnDisk } from "../essays";

const SITE = "https://www.somai.me";

test("sitemap.xml serves the same entries as before the migration", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");

  const xml = await response.text();
  expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  expect(xml).toContain(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  );

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");

  // Static entries, including the duplicate root entry the previous
  // implementation always emitted.
  expect(locs.filter((loc) => loc === SITE)).toHaveLength(2);
  expect(locs).toContain(`${SITE}/essays`);
  expect(locs).toContain(`${SITE}/research`);

  // Exactly one entry per essay in content/
  const essaySlugs = locs
    .filter((loc) => loc.startsWith(`${SITE}/essay/`))
    .map((loc) => loc.replace(`${SITE}/essay/`, ""))
    .sort();
  expect(essaySlugs).toEqual(essaySlugsOnDisk());
});

test("every essay URL in the sitemap resolves on this deployment", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");

  const paths = locs
    .map((loc) => new URL(loc).pathname)
    .filter((path) => path.startsWith("/essay/") || path === "/essays");

  expect(paths.length).toBeGreaterThan(0);

  for (const path of paths) {
    const response = await request.get(path);
    expect(response.status(), `${path} should resolve`).toBe(200);
  }
});

test("sitemap essay entries use the publish date as lastmod", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();

  // The agents essay was published on 2026-01-02
  expect(xml).toMatch(
    /<loc>https:\/\/www\.somai\.me\/essay\/agents<\/loc>\n<lastmod>2026-01-02T00:00:00\.000Z<\/lastmod>/
  );
});

test("robots.txt matches the previous output", async ({ request }) => {
  const response = await request.get("/robots.txt");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");

  const body = await response.text();
  expect(body).toBe(`User-Agent: *
Allow: /

Sitemap: https://www.somai.me/sitemap.xml
`);
});
