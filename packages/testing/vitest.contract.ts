/**
 * Contract layer: the real third-party API, with dedicated test resources.
 * Never on a pull request: run by the scheduled `contract` workflow or by
 * hand (`vitest run --project contract`).
 *
 *   import { contract } from "@workspace/testing/vitest.contract";
 *
 * Looks in tests/contract, one file per vendor. Tests skip themselves when
 * the vendor's credentials are not set.
 */
import type { TestProjectInlineConfiguration } from "vitest/config";

type ProjectTest = NonNullable<TestProjectInlineConfiguration["test"]>;

const LIVE_API_TIMEOUT_MS = 30_000;

export function contract(
  overrides: ProjectTest = {}
): TestProjectInlineConfiguration {
  return {
    extends: true,
    test: {
      name: "contract",
      include: ["tests/contract/**/*.test.{ts,tsx}"],
      environment: "node",
      testTimeout: LIVE_API_TIMEOUT_MS,
      ...overrides,
    },
  };
}
