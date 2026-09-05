import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { mdxPlugin } from "./mdx-plugin";
import { siteConfig } from "./src/config/site";

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
      // Prerender by crawling links from "/": the static pages land in
      // dist/client and every crawled page feeds sitemap.xml. Essays are
      // crawled but not rendered: they negotiate markdown on their URL, so
      // they stay server-rendered.
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: false,
        filter: (page) => !page.path.startsWith("/essay/"),
      },
      pages: [{ path: "/" }],
      sitemap: { host: siteConfig.url },
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
