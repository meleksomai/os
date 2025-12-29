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
        // miniflare: {
        //   durableObjects: {
        //     NAME: "HelloEmailAgent",
        //   },
        // },
        singleWorker: true,
        wrangler: {
          configPath: "./wrangler.jsonc",
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
