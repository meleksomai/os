/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";

test("baby announcement page renders", async ({ page, request }) => {
  await page.goto("/baby");

  await expect(page.getByText("Welcome to the world")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /sarah janet/i })
  ).toBeVisible();
  await expect(page.getByText("Proud parents Imen & Melek")).toBeVisible();

  // The photo is a local, resized asset (the original was a 23 MB upload).
  const photo = page.getByRole("img", { name: /baby sarah/i }).first();
  const src = await photo.getAttribute("src");
  expect(src).toMatch(/^\/images\/baby\//);
  const response = await request.get(src ?? "");
  expect(response.status()).toBe(200);
  expect(Number(response.headers()["content-length"])).toBeLessThan(1_000_000);
});

test("signbook dialog opens with the wish form", async ({ page }) => {
  await page.goto("/baby");

  await page.getByRole("button", { name: /share your wishes/i }).click();

  await expect(page.getByLabel(/your name/i)).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/your message/i)).toBeVisible();
});

test("a failed submission is reported inside the dialog", async ({ page }) => {
  await page.route("**/_serverFn/**", (route) =>
    route.fulfill({ status: 500, body: "" })
  );

  await page.goto("/baby");
  await page.getByRole("button", { name: /share your wishes/i }).click();
  await page.getByLabel(/your name/i).fill("Test Person");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/your message/i).fill("Congratulations!");
  await page.getByRole("button", { name: /send wishes/i }).click();

  await expect(page.getByRole("alert")).toContainText(
    "Something went wrong. Please try again."
  );
  await expect(
    page.getByRole("button", { name: /send wishes/i })
  ).toBeEnabled();
});
