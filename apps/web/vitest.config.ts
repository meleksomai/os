import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { mdxPlugin } from "./mdx-plugin";

export default defineConfig({
  // The MDX plugin lets the essay tests compile the real content.
  plugins: [tsConfigPaths({ projects: ["./tsconfig.json"] }), mdxPlugin()],
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
