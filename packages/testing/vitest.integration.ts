/**
 * Integration layer: the package's real code and SDKs against fakes of the
 * third parties, over HTTP. Hermetic, runs on every pull request.
 *
 *   import { integration } from "@workspace/testing/vitest.integration";
 *   integration({ globalSetup: ["./tests/integration/global-setup.ts"] })
 *
 * Looks in tests/integration. Start the fake in a globalSetup when the SDK
 * reads its base URL at module load. Select with `vitest --project integration`.
 */
import type { TestProjectInlineConfiguration } from "vitest/config";

type ProjectTest = NonNullable<TestProjectInlineConfiguration["test"]>;

export function integration(
  overrides: ProjectTest = {}
): TestProjectInlineConfiguration {
  return {
    extends: true,
    test: {
      name: "integration",
      include: ["tests/integration/**/*.test.{ts,tsx}"],
      environment: "node",
      ...overrides,
    },
  };
}
