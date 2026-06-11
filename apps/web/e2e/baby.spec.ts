/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";
import { mockServerFn } from "./helpers/server-fn";

test("baby announcement page renders", async ({ page }) => {
  await page.goto("/baby");

  await expect(page.getByText("Welcome to the world")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /sarah janet/i })
  ).toBeVisible();
  await expect(page.getByText("Proud parents Imen & Melek")).toBeVisible();
});

test("signbook dialog opens with the wish form", async ({ page }) => {
  await page.goto("/baby");

  await page.getByRole("button", { name: /share your wishes/i }).click();

  await expect(page.getByLabel(/your name/i)).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/your message/i)).toBeVisible();
});

test("submitting a wish shows the thank you message", async ({ page }) => {
  // submitWish returns void; mock the RPC so no database is needed.
  await mockServerFn(page, { result: undefined });

  await page.goto("/baby");

  await page.getByRole("button", { name: /share your wishes/i }).click();
  await page.getByLabel(/your name/i).fill("Test Person");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/your message/i).fill("Congratulations!");
  await page.getByRole("button", { name: /send wishes/i }).click();

  await expect(page.getByText(/thank you for your wishes/i)).toBeVisible({
    timeout: 10_000,
  });
});
