/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, type Page, test } from "@playwright/test";

interface ExpectedSeo {
  path: string;
  title?: string;
  description?: string;
  twitterTitle?: string;
  ogImage: string;
}

const HOME_DESCRIPTION =
  "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.";

const PAGES: ExpectedSeo[] = [
  {
    path: "/",
    title: "Melek Somai | Home",
    description: HOME_DESCRIPTION,
    twitterTitle: "Melek Somai",
    ogImage: "https://www.somai.me/og/home.png",
  },
  {
    path: "/essays",
    title: "Melek Somai | Essays",
    description:
      "A space to share thoughts and ideas that are often reflections on my current research.",
    twitterTitle: "Melek Somai | Essays",
    ogImage: "https://www.somai.me/og/essays.png",
  },
  {
    path: "/papers",
    title: "Melek Somai | Research Papers",
    description:
      "Research in areas ranging from Clinical Computing, Patient Remote Monitoring, Neuro-Epidemiology, to AI and Machine Learning",
    twitterTitle: "Melek Somai | Research Papers",
    ogImage: "https://www.somai.me/og/papers.png",
  },
  {
    path: "/essay/agents",
    title: "Melek Somai | Agent-First Systems and the Future of Software",
    description:
      "On harnesses, verifiability, and why human-in-the-loop is not the answer for safe AI agents",
    twitterTitle:
      "Melek Somai | Agent-First Systems and the Future of Software",
    ogImage: "https://www.somai.me/og/essay-agents.png",
  },
  {
    path: "/baby",
    ogImage: "https://www.somai.me/og/baby.png",
  },
];

function metaContent(page: Page, selector: string) {
  return page.locator(selector).getAttribute("content");
}

for (const expected of PAGES) {
  test(`SEO tags on ${expected.path}`, async ({ page, request }) => {
    await page.goto(expected.path);

    if (expected.title) {
      await expect(page).toHaveTitle(expected.title);
      expect(await metaContent(page, 'meta[property="og:title"]')).toBe(
        expected.title
      );
    }

    if (expected.description) {
      expect(await metaContent(page, 'meta[name="description"]')).toBe(
        expected.description
      );
      expect(await metaContent(page, 'meta[property="og:description"]')).toBe(
        expected.description
      );
    }

    if (expected.twitterTitle) {
      expect(await metaContent(page, 'meta[name="twitter:title"]')).toBe(
        expected.twitterTitle
      );
      expect(await metaContent(page, 'meta[name="twitter:creator"]')).toBe(
        "@meleksomai"
      );
    }

    expect(await metaContent(page, 'meta[name="twitter:card"]')).toBe(
      "summary_large_image"
    );
    expect(await metaContent(page, 'meta[property="og:image"]')).toBe(
      expected.ogImage
    );
    expect(await metaContent(page, 'meta[property="og:image:width"]')).toBe(
      "1200"
    );
    expect(await metaContent(page, 'meta[property="og:image:height"]')).toBe(
      "630"
    );
    expect(await metaContent(page, 'meta[name="twitter:image"]')).toBe(
      expected.ogImage
    );

    // The advertised OG image must actually resolve on this deployment.
    const imagePath = new URL(expected.ogImage).pathname;
    const imageResponse = await request.get(imagePath);
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()["content-type"]).toBe("image/png");

    // PNG IHDR dimensions must match the advertised 1200x630.
    const body = await imageResponse.body();
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  });
}

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
      `https://www.somai.me/og/essay-${essayPath.replace("/essay/", "")}.png`
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
