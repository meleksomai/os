import { contract } from "@workspace/testing/vitest.contract";
import { integration } from "@workspace/testing/vitest.integration";
import { unit } from "@workspace/testing/vitest.unit";
import { defineConfig } from "vitest/config";
import { INTEGRATION_RESEND_URL } from "./tests/integration/global-setup";

/**
 * Layers, selected with `vitest --project <name>` (see docs/testing.md):
 * - unit: SDK mocked.
 * - integration: real SDK against the fake Resend started by global-setup.
 * - contract: the real Resend API, on a schedule only.
 */
export default defineConfig({
  test: {
    projects: [
      unit(),
      integration({
        globalSetup: ["./tests/integration/global-setup.ts"],
        env: { RESEND_BASE_URL: INTEGRATION_RESEND_URL },
      }),
      contract(),
    ],
  },
});
