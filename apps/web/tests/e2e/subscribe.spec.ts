/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";

const SERVER_FN = "**/_serverFn/**";
// With real secrets in a local .dev.vars the round trip would subscribe a
// test address to the real audience.
const HAS_LOCAL_SECRETS = existsSync(
  new URL("../../.dev.vars", import.meta.url)
);

test.describe("Newsletter Subscription", () => {
  test("contact form section is visible on homepage", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /let's talk/i })
    ).toBeVisible();
    await expect(page.getByText(/no spam, just updates/i)).toBeVisible();
  });

  test("result states are hidden until a submission happens", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByText("You're on the list!")).not.toBeVisible();
    await expect(page.getByText("Something went wrong")).not.toBeVisible();
  });

  test("submit button is enabled only once an email is entered", async ({
    page,
  }) => {
    await page.goto("/");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await expect(submitButton).toBeDisabled();

    await page.locator('input[type="email"]').fill("test@example.com");
    await expect(submitButton).toBeEnabled();
  });

  test("shows the loading state while the request is in flight", async ({
    page,
  }) => {
    // Hold the request until the loading state has been observed.
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(SERVER_FN, async (route) => {
      await gate;
      await route.continue();
    });

    await page.goto("/");
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByRole("button", { name: /get updates/i }).click();

    await expect(page.getByText(/subscribing/i)).toBeVisible();
    release();
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
  });

  test("shows the server's answer without any mocks", async ({ page }) => {
    // biome-ignore lint/suspicious/noSkippedTests: a real .dev.vars would subscribe a real address
    test.skip(HAS_LOCAL_SECRETS, "a local .dev.vars would make this real");

    // No Resend secrets in the preview server: the real server function runs
    // inside the Worker and reports that subscriptions are unavailable. This
    // exercises the full browser → workerd → server function round trip.
    await page.goto("/");
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByRole("button", { name: /get updates/i }).click();

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("alert")).toContainText(
      /subscription temporarily unavailable/i
    );
    await expect(page.locator('input[type="email"]')).not.toBeVisible();
  });

  test("shows an error and can retry when the request fails", async ({
    page,
  }) => {
    let requestCount = 0;
    await page.route(SERVER_FN, async (route) => {
      requestCount += 1;
      if (requestCount === 1) {
        await route.fulfill({ status: 500, body: "" });
      } else {
        await route.continue();
      }
    });

    await page.goto("/");
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByRole("button", { name: /get updates/i }).click();

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("alert")).toContainText(
      "Something went wrong. Please try again."
    );

    await page.getByRole("button", { name: /try again/i }).click();

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toHaveValue("");
    await expect(page.getByRole("alert")).not.toBeVisible();
  });

  test("validates email format on the client", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("invalid-email");
    await page.getByRole("button", { name: /get updates/i }).click();

    // HTML5 validation blocks the submission: the form stays in place.
    await expect(emailInput).toBeVisible();
    await expect(page.getByRole("alert")).not.toBeVisible();
  });
});
