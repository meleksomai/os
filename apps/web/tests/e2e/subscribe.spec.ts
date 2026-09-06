/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";
import { recordedRequestsFor, uniqueEmail } from "./fakes/resend/client";
import {
  DUPLICATE_PREFIX,
  e2eDevVars,
  OUTAGE_PREFIX,
} from "./fakes/resend/shared";

// The browser's request to the TanStack server function. Routing it lets a
// test hold or fail the transport itself; everything past it is real: the
// server function runs inside workerd and calls the fake Resend server.
const SERVER_FN = "**/_serverFn/**";
const SUBSCRIBER_PREFIX = "subscriber-";

const { apiKey, audienceId } = e2eDevVars();

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
    await page
      .locator('input[type="email"]')
      .fill(uniqueEmail(SUBSCRIBER_PREFIX));
    await page.getByRole("button", { name: /get updates/i }).click();

    await expect(page.getByText(/subscribing/i)).toBeVisible();
    release();
    await expect(page.getByRole("status")).toBeVisible();
  });

  test("subscribes the address through the Worker to Resend", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail(SUBSCRIBER_PREFIX);
    const typed = `  ${email.toUpperCase()}  `;

    await page.goto("/");
    await page.locator('input[type="email"]').fill(typed);
    await page.getByRole("button", { name: /get updates/i }).click();

    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("You're on the list!");
    await expect(page.locator('input[type="email"]')).not.toBeVisible();

    // What Resend would have received: one contact creation on the configured
    // audience, authenticated with the configured key, address normalised.
    const received = await recordedRequestsFor(request, email);
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      method: "POST",
      path: `/audiences/${audienceId}/contacts`,
      authorization: `Bearer ${apiKey}`,
      body: { email, unsubscribed: false },
    });
  });

  test("an address that is already subscribed still succeeds", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail(DUPLICATE_PREFIX);

    await page.goto("/");
    await page.locator('input[type="email"]').fill(email);
    await page.getByRole("button", { name: /get updates/i }).click();

    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("You're on the list!");
    expect(await recordedRequestsFor(request, email)).toHaveLength(1);
  });

  test("a Resend outage shows the error state", async ({ page, request }) => {
    const email = uniqueEmail(OUTAGE_PREFIX);

    await page.goto("/");
    await page.locator('input[type="email"]').fill(email);
    await page.getByRole("button", { name: /get updates/i }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).toContainText(
      "Something went wrong. Please try again."
    );
    expect(await recordedRequestsFor(request, email)).toHaveLength(1);
  });

  test("shows an error and can retry when the request fails", async ({
    page,
  }) => {
    // The transport itself fails: the server function is never reached.
    await page.route(SERVER_FN, (route) =>
      route.fulfill({ status: 500, body: "" })
    );

    await page.goto("/");
    await page
      .locator('input[type="email"]')
      .fill(uniqueEmail(SUBSCRIBER_PREFIX));
    await page.getByRole("button", { name: /get updates/i }).click();

    await expect(page.getByRole("alert")).toBeVisible();
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
