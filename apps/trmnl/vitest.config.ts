import { workers } from "@workspace/testing/vitest.workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [workers({ configPath: "./wrangler.test.jsonc" })],
  },
});
