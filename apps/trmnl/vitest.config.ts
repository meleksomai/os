import { unit } from "@workspace/testing/vitest.unit";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [unit()],
  },
});
