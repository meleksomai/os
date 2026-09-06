import path from "node:path";
import { workers } from "@workspace/testing/vitest.workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./") },
  },
  test: {
    projects: [workers({ configPath: "./wrangler.test.jsonc" })],
  },
});
