import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { mdxPlugin } from "./mdx-plugin";

export default defineConfig({
  environments: {
    // Source maps for the Worker build only: wrangler uploads them so Workers
    // Logs resolve stack traces to src/. Client bundles stay map-free.
    ssr: { build: { sourcemap: true } },
  },
  plugins: [
    contentCollections({ environment: "ssr" }),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    mdxPlugin(),
    tanstackStart({
      importProtection: {
        // `files` replaces the defaults, so keep `*.server.*` and add the
        // per-domain server modules under src/server/<domain>/server.ts.
        client: {
          files: ["**/*.server.*", "**/src/server/*/server.ts"],
        },
      },
    }),
    viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
});
