import config from "@workspace/testing";
import { mergeConfig } from "vitest/config";

/**
 * Two projects, selected with `vitest --project <name>`:
 * - unit: everything mocked, runs on every PR (`pnpm test`).
 * - contract: the real Resend API, runs on a schedule (`pnpm test:contract`).
 */
export default mergeConfig(config, {
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "contract",
          include: ["tests/contract/**/*.test.ts"],
          // Live API calls: no parallelism, generous timeout.
          fileParallelism: false,
          testTimeout: 30_000,
        },
      },
    ],
  },
});
