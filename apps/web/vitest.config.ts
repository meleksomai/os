import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// The essay tests read the generated content collection, so run
// `pnpm run generate:content` (or `pnpm test`, which does) before a bare `vitest`.
export default defineConfig({
  plugins: [tsConfigPaths({ projects: ["./tsconfig.json"] })],
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    globals: true,
    restoreMocks: true,
  },
});
