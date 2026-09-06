/**
 * End-to-end layer: the app's production build driven through a browser,
 * with a fake for every third party. Runs on every pull request.
 *
 *   import { e2e } from "@workspace/testing/playwright.e2e";
 *   export default defineConfig({
 *     ...e2e,
 *     use: { ...e2e.use, baseURL: "http://localhost:4173" },
 *     webServer: [...],
 *   });
 *
 * Apps add the base URL and the servers to start: the app itself, built for
 * its e2e environment, plus a fake for every third party it talks to.
 */
import { devices, type PlaywrightTestConfig } from "@playwright/test";

const CI = Boolean(process.env.CI);

export const e2e = {
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? [["list"], ["github"], ["html"]] : "html",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
} satisfies PlaywrightTestConfig;
