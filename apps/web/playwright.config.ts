import { defineConfig, devices } from "@playwright/test";

/**
 * The suite runs against the production build served by `vite preview`,
 * i.e. the real Worker inside the Cloudflare workerd runtime.
 * Run `pnpm run build` before `pnpm run e2e`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["github"], ["html"]] : "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    stdout: process.env.CI ? "pipe" : "ignore",
  },
});
