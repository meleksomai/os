import path from "node:path";
import { defineConfig } from "vitest/config";
import { mdxPlugin } from "./src/lib/mdx-options";

export default defineConfig({
  plugins: [mdxPlugin()],
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", "dist", "e2e", ".turbo"],
    globals: true,
  },
});
