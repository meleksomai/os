/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { expect, test } from "@playwright/test";

test.describe("Newsletter Subscription", () => {
  test.beforeEach(async ({ page }) => {
    // Mock Resend API to prevent actual API calls
    await page.route("**/api.resend.com/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "contact_mock_123" }),
      });
    });
  });

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
    // Delay the response to see loading state
    await page.route("**/api.resend.com/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "contact_mock_123" }),
      });
    });

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

  test("shows error message when API fails", async ({ page }) => {
    // Mock API failure
    await page.route("**/api.resend.com/**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    // Wait for error message
    await expect(page.getByText(/something went wrong/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("can retry after error", async ({ page }) => {
    // First request fails
    let requestCount = 0;
    await page.route("**/api.resend.com/**", (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "contact_mock_123" }),
        });
      }
    });

    await page.goto("/");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");

    const submitButton = page.getByRole("button", { name: /get updates/i });
    await submitButton.click();

    // Wait for error
    await expect(page.getByText(/something went wrong/i)).toBeVisible({
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
