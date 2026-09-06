import { contract } from "@workspace/testing/vitest.contract";
import { integration } from "@workspace/testing/vitest.integration";
import { unit } from "@workspace/testing/vitest.unit";
import { defineConfig } from "vitest/config";

/**
 * Layers, selected with `vitest --project <name>` (see docs/testing.md):
 * - unit: SDK mocked.
 * - integration: real SDK against the fake Resend, which global-setup starts
 *   at the RESEND_BASE_URL set here (the SDK reads it at module load).
 * - contract: the real Resend API, on a schedule only.
 */
const INTEGRATION_RESEND_URL = "http://127.0.0.1:4175";
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
