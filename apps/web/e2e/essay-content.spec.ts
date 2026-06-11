/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";

test("essay renders MDX with metadata header", async ({ page }) => {
  await page.goto("/essay/agents");

  await expect(
    page.getByRole("heading", {
      name: "Agent-First Systems and the Future of Software",
    })
  ).toBeVisible();
  await expect(page.getByText(/January 2, 2026/)).toBeVisible();
  await expect(page.getByText(/min read/)).toBeVisible();
  await expect(page.getByText(/\d+ words/)).toBeVisible();
});

test("essay renders syntax-highlighted code blocks", async ({ page }) => {
  await page.goto("/essay/cloudflare_agents");

  // rehype-pretty-code + shiki emit data-theme coded blocks
  const codeBlock = page.locator("pre code[data-theme]").first();
  await expect(codeBlock).toBeAttached();

  const highlightedTokens = page.locator("pre code span[style]").first();
  await expect(highlightedTokens).toBeAttached();
});

test("essay renders GitHub-flavored footnotes", async ({ page }) => {
  await page.goto("/essay/agents");

  const footnotes = page.locator("section[data-footnotes]");
  await expect(footnotes).toBeAttached();

  const footnoteRef = page.locator("a[data-footnote-ref]").first();
  await expect(footnoteRef).toBeAttached();
});

test("essay headings expose anchor links", async ({ page }) => {
  await page.goto("/essay/cloudflare_agents");

  const anchor = page.locator(".heading-anchor").first();
  await expect(anchor).toBeAttached();

  const headingWithId = page.locator(".prose h2[id]").first();
  await expect(headingWithId).toBeAttached();
});

test("essay images load from the public directory", async ({
  page,
  request,
}) => {
  await page.goto("/essay/cloudflare_agents");

  const images = await page
    .locator(".prose img[src^='/images/']")
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("src") ?? ""));

  expect(images.length).toBeGreaterThan(0);

  for (const src of images) {
    const response = await request.get(src);
    expect(response.status(), `${src} should resolve`).toBe(200);
  }
});

test("custom MDX components render (quotes and icons)", async ({ page }) => {
  await page.goto("/essay/agents");

  // The agents essay opens with a blockquote rendered through the Callout
  // component and uses inline icons imported from @workspace/ui.
  await expect(
    page
      .locator(
        ".prose blockquote, .prose [class*='callout'], .prose [data-slot]"
      )
      .first()
  ).toBeAttached();
});
