import { defineWorkersProject } from "@cloudflare/vitest-pool-workers/config";
import path from "path";

export default defineWorkersProject({
  environments: {
    ssr: {
      keepProcessEnv: true,
    },
  },
  test: {
    poolOptions: {
      workers: {
        singleWorker: true,
        miniflare: {
          compatibilityDate: "2025-12-23",
          compatibilityFlags: ["nodejs_compat"],
        },
        wrangler: {
          configPath: "./wrangler.test.jsonc",
        },
      },
    },
    // https://github.com/cloudflare/workers-sdk/issues/9822
    deps: {
      optimizer: {
        ssr: {
          include: ["mimetext", "postal-mime", "agents"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@repo": path.resolve(__dirname, "../../packages"),
    },
  },
});
