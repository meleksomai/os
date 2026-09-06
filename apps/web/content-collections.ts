import {
  createDefaultImport,
  defineCollection,
  defineConfig,
  defineSingleton,
} from "@content-collections/core";
import type { MDXContent } from "mdx/types";
import readingTime from "reading-time";
import { z } from "zod";
import { generateOgImages } from "./scripts/generate-og";

/**
 * The site's content, validated and shaped at build time into the generated
 * `content-collections` module (`allEssays`, `research`), which the routes
 * import directly. Each essay document carries its compiled MDX component
 * (the pattern of content-collections' TanStack Start + Cloudflare sample),
 * so the essays ship in the client bundle.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `2026-01-02` → `January 2, 2026` */
const publishedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const essayFrontmatter = z.object({
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
});

/** An essay as the pages use it: its frontmatter, derived fields, and its page component. */
const essays = defineCollection({
  name: "essays",
  directory: "content",
  include: "*.mdx",
  schema: essayFrontmatter,
  transform: ({ content, _meta, ...frontmatter }) => {
    const { text, minutes, time, words } = readingTime(content);
    return {
      ...frontmatter,
      slug: _meta.path,
      publishedAtFormatted: publishedAtFormatter.format(
        new Date(frontmatter.publishedAt)
      ),
      readingTime: { text, minutes, time, words },
      // The compiled MDX (mdx-plugin.ts), imported by the generated module.
      mdx: createDefaultImport<MDXContent>(`../../content/${_meta.filePath}`),
    };
  },
  onSuccess: (essays) => generateOgImages(essays),
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
