import config from "@workspace/testing";
import { mergeConfig } from "vitest/config";

export default mergeConfig(config, {
  test: {
    include: ["**/*.test.ts"],
  },
});
