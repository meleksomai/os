import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { mdxPlugin } from "./src/lib/mdx-options";

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    mdxPlugin(),
    tanstackStart(),
    viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
});
