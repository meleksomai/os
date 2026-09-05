import mdx, { type Options } from "@mdx-js/rollup";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import type { Plugin } from "vite";

/**
 * How an essay's MDX becomes its page component, shared by Vite (the app) and
 * Vitest: GFM footnotes, table of contents, KaTeX, and rehype-pretty-code with
 * paired light/dark Shiki themes. The frontmatter is parsed by
 * content-collections.ts, so here it is only kept out of the output.
 */
export const mdxOptions: Options = {
  providerImportSource: "@mdx-js/react",
  remarkPlugins: [
    [remarkGfm, { footnoteLabelProperties: { className: ["sr-only"] } }],
    remarkToc,
    remarkFrontmatter,
  ],
  rehypePlugins: [
    [
      rehypePrettyCode,
      { theme: { dark: "github-dark", light: "github-light" } },
    ],
    rehypeSlug,
    [rehypeKatex, { strict: true, throwOnError: true }],
    [
      rehypeAutolinkHeadings,
      {
        properties: {
          ariaHidden: true,
          tabIndex: -1,
          className: "heading-anchor",
        },
      },
    ],
  ],
};

/** The MDX compiler as a Vite plugin, ahead of the React plugin. */
export function mdxPlugin(): Plugin {
  return { ...mdx(mdxOptions), enforce: "pre" } as Plugin;
}
