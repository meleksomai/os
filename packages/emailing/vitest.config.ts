import config from "@workspace/testing";
import { mergeConfig } from "vitest/config";

export default mergeConfig(config, {
  test: {
    include: ["**/*.test.ts"],
    // Contract tests hit the real Resend API: `pnpm test:contract` only.
    exclude: ["**/node_modules/**", "**/*.contract.test.ts"],
  },
});
