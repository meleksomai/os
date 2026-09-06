/**
 * Unit layer: everything external mocked. Runs on every pull request.
 *
 *   import { unit } from "@workspace/testing/vitest.unit";
 *   export default defineConfig({ test: { projects: [unit()] } });
 *
 * Looks in tests/unit and inherits the package's root config (plugins,
 * setupFiles, environment). Select with `vitest --project unit`.
 */
import type { TestProjectInlineConfiguration } from "vitest/config";
import { tsconfigAlias } from "./tsconfig-alias.ts";

type ProjectTest = NonNullable<TestProjectInlineConfiguration["test"]>;

export function unit(
  overrides: ProjectTest = {}
): TestProjectInlineConfiguration {
  return {
    extends: true,
    // The package's tsconfig `paths` (its `@/` alias), for test imports.
    resolve: { alias: tsconfigAlias() },
    test: {
      name: "unit",
      include: ["tests/unit/**/*.test.{ts,tsx}"],
      ...overrides,
    },
  };
}
