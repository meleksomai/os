/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";

test("theme switcher toggles dark mode", async ({ page }) => {
  await page.goto("/");

  const darkButton = page.getByRole("button", { name: "Dark theme" }).first();
  await darkButton.click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  const lightButton = page.getByRole("button", { name: "Light theme" }).first();
  await lightButton.click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("theme preference persists across navigation", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Dark theme" }).first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("link", { name: "Essays", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Essays" })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
