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
 * MDX pipeline shared by Vite (the app) and Vitest (unit tests), unchanged
 * from the previous Next.js configuration: GFM footnotes, table of contents,
 * frontmatter exported as `metadata`, `readingTime`, KaTeX, and
 * rehype-pretty-code with paired light/dark Shiki themes.
 */
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

type MdxTransform = (
  this: unknown,
  code: string,
  id: string
) => Promise<unknown> | unknown;

/**
 * `@mdx-js/rollup` strips query strings before matching ids, so it would also
 * compile the `content/*.mdx?raw` imports that feed the markdown renditions.
 * This wrapper leaves any queried id to Vite's own loaders.
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
