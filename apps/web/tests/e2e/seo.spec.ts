/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, type Page, test } from "@playwright/test";

interface ExpectedSeo {
  path: string;
  title: string;
  description: string;
  twitterTitle: string;
  ogImage: string;
  ogType: "website" | "article";
  jsonLdType: string | null;
}

const SITE = "https://www.somai.me";
const HOME_DESCRIPTION =
  "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.";

const PAGES: ExpectedSeo[] = [
  {
    path: "/",
    title: "Melek Somai | Home",
    description: HOME_DESCRIPTION,
    twitterTitle: "Melek Somai",
    ogImage: `${SITE}/og/home.png`,
    ogType: "website",
    jsonLdType: "Person",
  },
  {
    path: "/essays",
    title: "Melek Somai | Essays",
    description:
      "A space to share thoughts and ideas that are often reflections on my current research.",
    twitterTitle: "Melek Somai | Essays",
    ogImage: `${SITE}/og/essays.png`,
    ogType: "website",
    jsonLdType: null,
  },
  {
    path: "/papers",
    title: "Melek Somai | Research Papers",
    description:
      "Research in areas ranging from Clinical Computing, Patient Remote Monitoring, Neuro-Epidemiology, to AI and Machine Learning",
    twitterTitle: "Melek Somai | Research Papers",
    ogImage: `${SITE}/og/papers.png`,
    ogType: "website",
    jsonLdType: null,
  },
  {
    path: "/essay/agents",
    title: "Melek Somai | Agent-First Systems and the Future of Software",
    description:
      "On harnesses, verifiability, and why human-in-the-loop is not the answer for safe AI agents",
    twitterTitle:
      "Melek Somai | Agent-First Systems and the Future of Software",
    ogImage: `${SITE}/og/essay-agents.png`,
    ogType: "article",
    jsonLdType: "BlogPosting",
  },
];

function metaContent(page: Page, selector: string) {
  return page.locator(selector).getAttribute("content");
}

for (const expected of PAGES) {
  test(`SEO tags on ${expected.path}`, async ({ page, request }) => {
    await page.goto(expected.path);
    const canonical = expected.path === "/" ? SITE : `${SITE}${expected.path}`;

    await expect(page).toHaveTitle(expected.title);
    expect(await metaContent(page, 'meta[property="og:title"]')).toBe(
      expected.title
    );
    expect(await metaContent(page, 'meta[name="description"]')).toBe(
      expected.description
    );
    expect(await metaContent(page, 'meta[property="og:description"]')).toBe(
      expected.description
    );
    expect(await metaContent(page, 'meta[property="og:type"]')).toBe(
      expected.ogType
    );
    expect(await metaContent(page, 'meta[property="og:site_name"]')).toBe(
      "Melek Somai"
    );
    expect(await metaContent(page, 'meta[property="og:url"]')).toBe(canonical);
    expect(
      await page.locator('link[rel="canonical"]').getAttribute("href")
    ).toBe(canonical);

    expect(await metaContent(page, 'meta[name="twitter:card"]')).toBe(
      "summary_large_image"
    );
    expect(await metaContent(page, 'meta[name="twitter:site"]')).toBe(
      "@meleksomai"
    );
    expect(await metaContent(page, 'meta[name="twitter:title"]')).toBe(
      expected.twitterTitle
    );
    expect(await metaContent(page, 'meta[property="og:image"]')).toBe(
      expected.ogImage
    );
    expect(await metaContent(page, 'meta[name="twitter:image"]')).toBe(
      expected.ogImage
    );

    // Structured data, when the page has any, must be valid JSON of the expected type.
    const scripts = page.locator('script[type="application/ld+json"]');
    if (expected.jsonLdType === null) {
      await expect(scripts).toHaveCount(0);
    } else {
      const data = JSON.parse((await scripts.first().textContent()) ?? "{}");
      expect(data["@type"]).toBe(expected.jsonLdType);
      expect(data["@context"]).toBe("https://schema.org");
    }

    // The advertised OG image must actually resolve on this deployment.
    const imageResponse = await request.get(new URL(expected.ogImage).pathname);
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()["content-type"]).toBe("image/png");

    // PNG IHDR dimensions must match the advertised og:image:width/height.
    const width = await metaContent(page, 'meta[property="og:image:width"]');
    const height = await metaContent(page, 'meta[property="og:image:height"]');
    const body = await imageResponse.body();
    expect(String(body.readUInt32BE(16))).toBe(width);
    expect(String(body.readUInt32BE(20))).toBe(height);
  });
}

test("essays carry article metadata", async ({ page }) => {
  await page.goto("/essay/agents");

  expect(
    await metaContent(page, 'meta[property="article:published_time"]')
  ).toBe("2026-01-02T00:00:00.000Z");
  expect(await metaContent(page, 'meta[property="article:author"]')).toBe(SITE);
});

test("every essay page advertises its own OG image", async ({
  page,
  request,
}) => {
  await page.goto("/essays");

  const essayPaths = await page
    .locator('a[href^="/essay/"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? "")
    );

  expect(essayPaths.length).toBeGreaterThan(0);

  for (const essayPath of essayPaths) {
    await page.goto(essayPath);
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(ogImage).toBe(
      `${SITE}/og/essay-${essayPath.replace("/essay/", "")}.png`
    );

    const imageResponse = await request.get(new URL(ogImage ?? "").pathname);
    expect(imageResponse.status()).toBe(200);
  }
});

test("favicon and icons resolve", async ({ request }) => {
  for (const icon of ["/favicon.ico", "/icon.png", "/apple-icon.png"]) {
    const response = await request.get(icon);
    expect(response.status(), `${icon} should resolve`).toBe(200);
  }
});
