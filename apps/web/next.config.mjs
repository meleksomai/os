import createMDX from "@next/mdx";
import createWithVercelToolbar from "@vercel/toolbar/plugins/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

/** @type {import('rehype-pretty-code').Options} */
const options = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-toc",
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "metadata" }],
      "remark-reading-time",
      "remark-reading-time/mdx",
    ],
    rehypePlugins: [
      ["rehype-pretty-code", options],
      "rehype-slug",
      ["rehype-katex", { strict: true, throwOnError: true }],
      [
        "rehype-autolink-headings",
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
  },
});

const withVercelToolbar = createWithVercelToolbar();

// Merge MDX config with Next.js config
export default withMDX(withVercelToolbar(nextConfig));
