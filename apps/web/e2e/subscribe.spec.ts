/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { expect, test } from "@playwright/test";
import { mockServerFn } from "./helpers/server-fn";

const SUCCESS = { success: true, message: "Thanks for subscribing!" };

test.describe("Newsletter Subscription", () => {
  test("contact form section is visible on homepage", async ({ page }) => {
    await page.goto("/");

    const contactSection = page.getByRole("heading", {
      name: /let's talk/i,
    });
    await expect(contactSection).toBeVisible();
  });

  test("email input and submit button are present", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.getByRole("button", { name: /get updates/i });

    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("submit button is disabled when email is empty", async ({ page }) => {
    await page.goto("/");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await expect(submitButton).toBeDisabled();
  });

  test("submit button is enabled when email is entered", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await expect(submitButton).toBeEnabled();
  });

  test("shows loading state when submitting", async ({ page }) => {
    // Delay the mocked RPC response to observe the loading state
    await mockServerFn(page, { result: SUCCESS, delayMs: 500 });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    // Check for loading state
    await expect(page.getByText(/subscribing/i)).toBeVisible();
  });

  test("shows success message after successful subscription", async ({
    page,
  }) => {
    await mockServerFn(page, { result: SUCCESS });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    // Wait for success message
    await expect(page.getByText(/you're on the list/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("displays submitted email in success message", async ({ page }) => {
    await mockServerFn(page, { result: SUCCESS });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("myemail@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    await expect(page.getByText("myemail@example.com")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows subscribe another email button after success", async ({
    page,
  }) => {
    await mockServerFn(page, { result: SUCCESS });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    await expect(
      page.getByRole("button", { name: /subscribe another email/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can reset form after success", async ({ page }) => {
    await mockServerFn(page, { result: SUCCESS });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    // Wait for success
    await expect(page.getByText(/you're on the list/i)).toBeVisible({
      timeout: 10_000,
    });

    // Click reset button
    const resetButton = page.getByRole("button", {
      name: /subscribe another email/i,
    });
    await resetButton.click();

    // Form should be visible again
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("shows server-side validation error without any mocks", async ({
    page,
  }) => {
    // No RPC mock and no Resend env vars on the preview server: the real
    // server function runs and deterministically reports that subscriptions
    // are unavailable. This exercises the full client → worker round trip.
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    await expect(
      page.getByText("Something went wrong", { exact: true })
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/subscription temporarily unavailable/i)
    ).toBeVisible();
  });

  test("shows error message when API fails", async ({ page }) => {
    // Mock RPC failure
    await mockServerFn(page, { status: 500 });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    // Wait for error message
    await expect(
      page.getByText("Something went wrong", { exact: true })
    ).toBeVisible({
      timeout: 10_000,
    });
  });

  test("can retry after error", async ({ page }) => {
    // First request fails
    let requestCount = 0;
    await page.route("**/_serverFn/**", async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    // Wait for error
    await expect(
      page.getByText("Something went wrong", { exact: true })
    ).toBeVisible({
      timeout: 10_000,
    });

    // Click try again - use force to handle potential overlay issues
    const tryAgainButton = page.getByRole("button", { name: /try again/i });
    await tryAgainButton.click({ force: true });

    // Form should be visible again
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("validates email format on client side", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');

    // Enter invalid email - HTML5 validation should prevent submission
    await emailInput.fill("invalid-email");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    // The form should not submit due to HTML5 validation
    // The input should still be visible (not showing success/error states)
    await expect(emailInput).toBeVisible();
  });

  test("displays unsubscribe notice", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/no spam, just updates/i)).toBeVisible();
  });
});
