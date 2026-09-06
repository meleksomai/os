import { defineConfig } from "@playwright/test";
import {
  FAKE_HEALTH_PATH,
  FAKE_RESEND_HOST,
  FAKE_RESEND_PORT,
} from "@workspace/emailing/testing/fake-resend";
import { e2e } from "@workspace/testing/playwright.e2e";

/**
 * The suite runs against a production build served by `vite preview`, i.e.
 * the real Worker inside the workerd runtime, built for the `e2e` Cloudflare
 * environment (wrangler.jsonc `env.e2e`, selected with CLOUDFLARE_ENV). That
 * environment points the Resend SDK at the fake Resend below instead of
 * api.resend.com, so the suite is hermetic: nothing reaches a third party.
 *
 * The preview is always started fresh, never reused: a preview of another
 * environment on the same port could carry real secrets.
 */
export default defineConfig({
  ...e2e,
  use: {
    ...e2e.use,
    baseURL: "http://localhost:4173",
  },
  webServer: [
    {
      command: "pnpm --filter @workspace/emailing fake-resend",
      url: `http://${FAKE_RESEND_HOST}:${FAKE_RESEND_PORT}${FAKE_HEALTH_PATH}`,
      reuseExistingServer: !process.env.CI,
    },
    {
      // Only the build selects the environment; the preview serves the
      // resolved config in dist/server. (The build's prerender pass boots
      // that resolved config too and logs a harmless "No environment found
      // in configuration with name e2e".)
      command: "CLOUDFLARE_ENV=e2e pnpm run build && pnpm run preview",
      url: "http://localhost:4173",
      timeout: 240_000,
      reuseExistingServer: false,
      stdout: process.env.CI ? "pipe" : "ignore",
    },
  ],
});
