import { writeFile } from "node:fs/promises";
import {
  defineCollection,
  defineConfig,
  defineSingleton,
} from "@content-collections/core";
import readingTime from "reading-time";
import { z } from "zod";
import { mdxToMarkdown, plainText } from "./mdx-to-markdown";
import { formatPublishedAt, parsePublishedAt } from "./src/lib/date";

/**
 * The site's content, validated and shaped at build time. The generated
 * `content-collections` module (`allEssays`, `research`) is read only by
 * `src/server/<domain>/server.ts`, which import protection keeps out of the
 * client; a Biome rule (biome.jsonc) rejects the import anywhere else.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const essays = defineCollection({
  name: "essays",
  directory: "content",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    category: z.string(),
    featured: z.boolean(),
    /** `YYYY-MM-DD` */
    publishedAt: z.string().regex(ISO_DATE),
    audio: z.string().optional(),
    image: z.string().optional(),
    /** The MDX body without its frontmatter (added by the parser). */
    content: z.string(),
  }),
  transform: async ({ content, _meta, ...frontmatter }, { cache }) => {
    const markdown = await cache(content, mdxToMarkdown);
    const { text, minutes, time, words } = readingTime(plainText(markdown));
    return {
      ...frontmatter,
      slug: _meta.path,
      publishedAtFormatted: formatPublishedAt(
        parsePublishedAt(frontmatter.publishedAt)
      ),
      readingTime: { text, minutes, time, words },
      markdown,
    };
  },
  // What the sitemap needs from the essays; sitemap-pages.ts reads it into
  // the `pages` option of the TanStack Start plugin (vite.config.ts).
  onSuccess: (essays) =>
    writeFile(
      ".content-collections/sitemap.json",
      JSON.stringify({
        essays: essays.map(({ slug, publishedAt }) => ({ slug, publishedAt })),
      })
    ),
});

/** A record of the Paperpile export in content/papers.json; only these fields are kept. */
const paper = z.looseObject({
  _id: z.string(),
  title: z.string(),
  doi: z.string().optional(),
  url: z.array(z.string()).optional(),
  published: z.looseObject({ year: z.string() }),
  publisher: z.string().optional(),
});

const research = defineSingleton({
  name: "research",
  filePath: "content/papers.json",
  parser: "json",
  schema: z.object({ papers: z.array(paper) }),
  transform: ({ papers }) => ({
    papers: papers.map(({ _id, title, doi, url, published, publisher }) => ({
      _id,
      title,
      doi,
      url,
      published: { year: published.year },
      publisher,
    })),
  }),
});

export default defineConfig({ content: [essays, research] });
