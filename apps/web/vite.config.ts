import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkReadingTime from "remark-reading-time";
import remarkReadingTimeMdx from "remark-reading-time/mdx";
import remarkToc from "remark-toc";
import { defineConfig, type Plugin } from "vite";
import { getEssaySlugsSync } from "./src/lib/essay-slugs";

// Repointed `@/*` -> ./src/* alias (mirrors tsconfig paths) so Rollup/Vite
// resolves the bare `@/...` specifiers used across the app.
const srcDir = fileURLToPath(new URL("./src", import.meta.url));

const prettyCodeOptions = {
  theme: { dark: "github-dark", light: "github-light" },
};
const gfmOptions = { footnoteLabelProperties: { className: ["sr-only"] } };

// The @mdx-js/rollup plugin strips the query off the id and compiles ANY .mdx
// file, so it would also (incorrectly) compile `*.mdx?raw` imports. We need the
// raw source string for the essay `.md` content negotiation, so wrap the plugin
// to bail on `?raw` ids and let Vite's built-in raw loader return the text.
const mdxPlugin = mdx({
  // Next pageExtensions included both .md and .mdx — widen accordingly.
  mdxExtensions: [".mdx", ".md"],
  format: "mdx",
  providerImportSource: "@mdx-js/react", // makes <MDXProvider> context flow
  jsxImportSource: "react",
  remarkPlugins: [
    [remarkGfm, gfmOptions],
    remarkToc,
    remarkFrontmatter,
    [remarkMdxFrontmatter, { name: "metadata" }],
    // ORDER MATTERS: base reading-time sets file.data, /mdx exports `readingTime`.
    remarkReadingTime,
    remarkReadingTimeMdx,
  ],
  rehypePlugins: [
    [rehypePrettyCode, prettyCodeOptions],
    rehypeSlug,
    [rehypeKatex, { strict: true, throwOnError: true }],
    [
      rehypeAutolinkHeadings,
      {
        behaviour: "append",
        properties: {
          ariaHidden: true,
          tabIndex: -1,
          className: "heading-anchor",
        },
      },
    ],
  ],
});

// @mdx-js/rollup exposes a single `transform` function hook. Wrap it so it bails
// on `*.mdx?raw` ids (returning undefined lets Vite's raw loader handle them).
const baseMdxPlugin = mdxPlugin as Plugin;
type MdxTransform = Extract<Plugin["transform"], (...args: never) => unknown>;
const mdxTransform = baseMdxPlugin.transform as MdxTransform;
const mdxPrePlugin: Plugin = {
  ...baseMdxPlugin,
  enforce: "pre",
  transform(code, id, options) {
    // Skip explicit raw imports so `*.mdx?raw` yields the source string.
    if (id.includes("?raw")) {
      return;
    }
    return mdxTransform.call(this, code, id, options);
  },
};

export default defineConfig({
  server: { port: 3000 }, // matches playwright baseURL :3000
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  plugins: [
    tailwindcss(),
    // MDX MUST run before viteReact: enforce:'pre' + placed before it.
    mdxPrePlugin,
    // TanStack Router/Start plugin MUST come BEFORE the React JSX transform.
    tanstackStart({
      srcDirectory: "src",
      // Static prerender (replaces generateStaticParams + dynamicParams=false).
      prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: false },
      pages: [
        // Enumerate every essay slug so /essay/<slug> and /essay/<slug>.md
        // are statically built. crawlLinks also catches links from /essays.
        ...getEssaySlugsSync().flatMap((slug) => [
          { path: `/essay/${slug}` },
          { path: `/essay/${slug}.md` },
        ]),
      ],
    }),
    viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    nitro(),
  ],
  // @workspace/ui ships TS/TSX source; transform it for SSR
  // (replaces Next transpilePackages: ['@workspace/ui']).
  ssr: {
    noExternal: ["@workspace/ui"],
    // @vercel/og bundles a native/wasm renderer — keep it external to the SSR bundle.
    // Verify during Verify; add '@resvg/resvg-js' here only if a native-binary error appears.
    external: ["@vercel/og"],
  },
});
