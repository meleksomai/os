/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";
import { essaySlugsOnDisk } from "../essays";

const CRAWL_PAGES = ["/", "/essays", "/papers", "/essay/agents", "/baby"];

test("every internal link on every page resolves", async ({
  page,
  request,
}) => {
  const seen = new Set<string>();

  for (const pagePath of CRAWL_PAGES) {
    await page.goto(pagePath);

    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? "")
      );

    for (const href of hrefs) {
      const path = href.split("#")[0]?.split("?")[0];
      if (!path || seen.has(path)) {
        continue;
      }
      seen.add(path);

      const response = await request.get(path, { maxRedirects: 5 });
      expect(
        response.status(),
        `link ${path} found on ${pagePath} should resolve`
      ).toBeLessThan(400);
    }
  }

  // Sanity: the crawl actually visited the core routes.
  expect(seen.has("/essays")).toBe(true);
  expect(seen.has("/papers")).toBe(true);
});

test("navbar navigation works on every site page", async ({ page }) => {
  await page.goto("/essays");
  await page.getByRole("link", { name: "Research" }).click();
  await expect(page).toHaveURL(/\/papers$/);
  await expect(page.getByRole("heading", { name: "Papers" })).toBeVisible();

  await page.getByRole("link", { name: "meleksomai" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Melek" })).toBeVisible();
});

test("client-side navigation between essays keeps content working", async ({
  page,
}) => {
  await page.goto("/essays");

  const essayLinks = page.locator('a[href^="/essay/"]');
  await expect(essayLinks).toHaveCount(essaySlugsOnDisk().length);

  await essayLinks.first().click();
  await expect(page.locator("article")).toBeVisible();
  await expect(page.locator(".prose p").first()).toBeVisible();

  await page.goBack();
  await expect(page.getByRole("heading", { name: "Essays" })).toBeVisible();
});
