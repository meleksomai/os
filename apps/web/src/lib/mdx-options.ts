import mdx, { type Options } from "@mdx-js/rollup";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkReadingTime from "remark-reading-time";
import remarkReadingMdxTime from "remark-reading-time/mdx";
import remarkToc from "remark-toc";
import type { Plugin } from "vite";

/**
 * MDX pipeline shared by Vite (app build) and Vitest (unit tests).
 * Mirrors the plugin chain previously configured in next.config.mjs.
 */
type MdxTransform = (
  this: unknown,
  code: string,
  id: string
) => Promise<unknown> | unknown;

/**
 * @mdx-js/rollup strips query strings before filtering, which would compile
 * `content/*.mdx?raw` imports into components instead of leaving them to
 * Vite's raw loader. This wrapper skips any queried module id.
 */
export function mdxPlugin(): Plugin {
  const plugin = mdx(mdxOptions);
  const transform = plugin.transform as MdxTransform;

  return {
    ...plugin,
    enforce: "pre",
    transform(this: unknown, code: string, id: string) {
      if (id.includes("?")) {
        return null;
      }
      return transform.call(this, code, id);
    },
  } as Plugin;
}

export const mdxOptions: Options = {
  providerImportSource: "@mdx-js/react",
  remarkPlugins: [
    [remarkGfm, { footnoteLabelProperties: { className: ["sr-only"] } }],
    remarkToc,
    remarkFrontmatter,
    [remarkMdxFrontmatter, { name: "metadata" }],
    remarkReadingTime,
    remarkReadingMdxTime,
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
