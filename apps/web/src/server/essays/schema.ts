/** The YAML frontmatter of `content/<slug>.mdx`, as the author writes it. */
export interface EssayFrontmatter {
  title: string;
  subtitle: string;
  category: string;
  featured: boolean;
  /** `YYYY-MM-DD` */
  publishedAt: string;
  audio?: string;
  image?: string;
}

/** Reading-time estimate exported by the MDX pipeline (remark-reading-time). */
export interface EssayReadingTime {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

/** An essay as the app uses it: its slug, its frontmatter, and what the MDX pipeline derived. */
export interface Essay extends EssayFrontmatter {
  slug: string;
  /** `publishedAt` for display, e.g. "January 2, 2026". */
  publishedAtFormatted: string;
  readingTime: EssayReadingTime;
}

const MDX_EXTENSION = /\.mdx$/;

/** `content/agents.mdx` → `agents`. Shared by the app and the OG image script. */
export function essaySlugFromPath(path: string): string {
  const fileName = path.split("/").pop() ?? path;
  return fileName.replace(MDX_EXTENSION, "");
}
