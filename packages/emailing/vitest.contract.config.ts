import config from "@workspace/testing";
import { mergeConfig } from "vitest/config";

/** Only the contract tests, which talk to the real Resend API. */
export default mergeConfig(config, {
  test: {
    include: ["**/*.contract.test.ts"],
    // A live API call: no parallelism, generous timeout.
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
