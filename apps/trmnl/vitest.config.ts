import { unit } from "@workspace/testing/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [unit()],
  },
});
