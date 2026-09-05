/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";

test("unknown URLs return 404 with the custom page", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByText("404 - Idea not found")).toBeVisible();
  await expect(
    page.getByText(/every doctor who deserves to be replaced/i)
  ).toBeVisible();
});

test("unknown essay slugs return 404", async ({ page }) => {
  const response = await page.goto("/essay/this-essay-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByText("404 - Idea not found")).toBeVisible();
});
