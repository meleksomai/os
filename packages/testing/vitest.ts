/**
 * Shared Vitest projects, one per test layer (see docs/testing.md).
 *
 * A package declares which layers it has:
 *
 *   export default defineConfig({
 *     test: { projects: [unit(), integration(), contract()] },
 *   });
 *
 * and selects them by name: `vitest run --project unit --project integration`.
 * Each project inherits the package's root config (plugins, setupFiles,
 * environment) and looks in the conventional folder under tests/.
 */
import type { TestProjectInlineConfiguration } from "vitest/config";

type ProjectTest = NonNullable<TestProjectInlineConfiguration["test"]>;

function project(
  name: string,
  defaults: ProjectTest,
  overrides: ProjectTest
): TestProjectInlineConfiguration {
  return {
    extends: true,
    test: {
      name,
      include: [`tests/${name}/**/*.test.{ts,tsx}`],
      ...defaults,
      ...overrides,
    },
  };
}

/** Everything external mocked. Runs on every pull request. */
export function unit(
  overrides: ProjectTest = {}
): TestProjectInlineConfiguration {
  return project("unit", {}, overrides);
}

/**
 * The package's real code and SDKs against fakes of the third parties, over
 * HTTP. Runs on every pull request; still hermetic.
 */
export function integration(
  overrides: ProjectTest = {}
): TestProjectInlineConfiguration {
  return project("integration", { environment: "node" }, overrides);
}

/**
 * The real third-party API, with dedicated test resources. Never on a pull
 * request: run by the scheduled `contract` workflow or by hand.
 */
export function contract(
  overrides: ProjectTest = {}
): TestProjectInlineConfiguration {
  // Live API calls: a generous timeout. (File parallelism is a root-level
  // option; contract folders hold one file per vendor anyway.)
  return project(
    "contract",
    { environment: "node", testTimeout: 30_000 },
    overrides
  );
}
