/**
 * Unit layer for Cloudflare Workers: the tests run inside workerd through
 * @cloudflare/vitest-pool-workers, with the bindings of a test-only Wrangler
 * config (a wrangler.test.jsonc that declares local bindings only: KV,
 * Durable Objects, no remote services).
 *
 *   import { workers } from "@workspace/testing/vitest.workers";
 *   export default defineConfig({
 *     test: { projects: [workers({ configPath: "./wrangler.test.jsonc" })] },
 *   });
 *
 * Same folder and name as `unit()` (tests/unit, `vitest --project unit`), so
 * a Worker app is selected and run like every other package; only the
 * runtime differs. Inherits the app's root config (aliases, environments).
 */
import {
  defineWorkersProject,
  type WorkersProjectConfigExport,
} from "@cloudflare/vitest-pool-workers/config";
import type { TestProjectInlineConfiguration } from "vitest/config";
import { tsconfigAlias } from "./tsconfig-alias.ts";

// The pool fixes `pool`/`poolOptions`; callers tune everything else.
type ProjectTest = Omit<
  NonNullable<TestProjectInlineConfiguration["test"]>,
  "pool" | "poolMatchGlobs" | "poolOptions"
>;
type PoolWorkers = Exclude<
  NonNullable<
    NonNullable<
      NonNullable<WorkersProjectConfigExport["test"]>["poolOptions"]
    >["workers"]
  >,
  (...args: never[]) => unknown
>;

export interface WorkersOptions {
  /** Wrangler config the tests run with, relative to the app. */
  configPath: string;
  /** Miniflare overrides, e.g. a compatibility date or extra bindings. */
  miniflare?: PoolWorkers["miniflare"];
  /** Further Vitest options for the project. */
  test?: ProjectTest;
}

export function workers({
  configPath,
  miniflare,
  test,
}: WorkersOptions): TestProjectInlineConfiguration {
  return {
    extends: true,
    // The package's tsconfig `paths` (its `@/` alias), for test imports.
    resolve: { alias: tsconfigAlias() },
    ...defineWorkersProject({
      test: {
        name: "unit",
        include: ["tests/unit/**/*.test.{ts,tsx}"],
        poolOptions: {
          workers: {
            singleWorker: true,
            wrangler: { configPath },
            miniflare,
          },
        },
        ...test,
      },
    }),
  };
}
