import { expect, test } from "@playwright/test";

test("home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Melek" })).toBeVisible();
});

test("essays list renders and an essay page opens", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Essays", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Essays" })).toBeVisible();

  const firstEssayLink = page.locator('a[href^="/essay/"]').first();
  await expect(firstEssayLink).toBeVisible();
  await firstEssayLink.click();

  await expect(page.locator("article")).toBeVisible();
});

test("papers page renders", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Research" }).click();
  await expect(page.getByRole("heading", { name: "Papers" })).toBeVisible();
});
