export interface EssayMetadata {
  title: string;
  subtitle: string;
  featured: boolean;
  publishedAt: string;
  publishedAtFormatted: string;
  audio?: string;
  image?: string;
  category: string;
}

export interface EssayReadingTime {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

export interface EssayListItem {
  slug: string;
  metadata: EssayMetadata;
  readingTime: EssayReadingTime;
}

/** Validator for the essay server function: a slug from the URL. */
export function essaySlug(slug: unknown): string {
  if (typeof slug !== "string") {
    throw new Error("Expected an essay slug");
  }
  return slug;
}

const MDX_EXTENSION = /\.mdx$/;

/** `content/agents.mdx` → `agents`. Shared by the app and the OG image script. */
export function essaySlugFromPath(path: string): string {
  const fileName = path.split("/").pop() ?? path;
  return fileName.replace(MDX_EXTENSION, "");
}
