import { workers } from "@workspace/testing/vitest.workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  environments: {
    ssr: {
      keepProcessEnv: true,
    },
  },
  test: {
    projects: [
      workers({
        configPath: "./wrangler.test.jsonc",
        miniflare: {
          compatibilityDate: "2025-12-23",
          compatibilityFlags: ["nodejs_compat"],
        },
        test: {
          // https://github.com/cloudflare/workers-sdk/issues/9822
          deps: {
            optimizer: {
              ssr: {
                include: ["mimetext", "postal-mime", "agents"],
              },
            },
          },
        },
      }),
    ],
  },
});
