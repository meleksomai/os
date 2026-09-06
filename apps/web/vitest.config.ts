import { unit } from "@workspace/testing/vitest.unit";
import { defineConfig } from "vitest/config";
import { mdxPlugin } from "./mdx-plugin";

// The essay tests read the generated content collection, so run
// `pnpm run generate:content` (or `pnpm test`, which does) before a bare `vitest`.
export default defineConfig({
  plugins: [mdxPlugin()],
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    restoreMocks: true,
    projects: [unit()],
  },
});
