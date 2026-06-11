import { formatPublishedAt, parsePublishedAt } from "../lib/date";

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

type Frontmatter = Omit<EssayMetadata, "publishedAtFormatted">;

const frontmatterByPath = import.meta.glob("../../content/*.mdx", {
  eager: true,
  import: "metadata",
}) as Record<string, Frontmatter>;

const readingTimeByPath = import.meta.glob("../../content/*.mdx", {
  eager: true,
  import: "readingTime",
}) as Record<string, EssayReadingTime>;

const mdxExtensionRegex = /\.mdx$/;

export function essaySlugFromPath(path: string): string {
  const fileName = path.split("/").pop() ?? path;
  return fileName.replace(mdxExtensionRegex, "");
}

function buildCatalog(): EssayListItem[] {
  return Object.entries(frontmatterByPath)
    .map(([path, frontmatter]) => {
      const readingTime = readingTimeByPath[path];
      if (!readingTime) {
        throw new Error(`Missing reading time for essay: ${path}`);
      }

      const publishedAtDate = parsePublishedAt(frontmatter.publishedAt);

      return {
        slug: essaySlugFromPath(path),
        metadata: {
          ...frontmatter,
          publishedAtFormatted: formatPublishedAt(publishedAtDate),
        },
        readingTime,
      };
    })
    .sort(
      (a, b) =>
        parsePublishedAt(b.metadata.publishedAt).getTime() -
        parsePublishedAt(a.metadata.publishedAt).getTime()
    );
}

export const essayCatalog: EssayListItem[] = buildCatalog();

export function getEssayBySlug(slug: string): EssayListItem | null {
  return essayCatalog.find((essay) => essay.slug === slug) ?? null;
}
