import { formatPublishedAt, parsePublishedAt } from "@/lib/date";
import { essaySlugFromPath } from "./slug";
import type { EssayListItem, EssayMetadata, EssayReadingTime } from "./types";

type Frontmatter = Omit<EssayMetadata, "publishedAtFormatted">;

// Only the named exports produced by the MDX pipeline (remark-mdx-frontmatter
// and remark-reading-time) are imported here, so this module never renders an
// essay. The components live in ./components.ts.
const frontmatterByPath = import.meta.glob<Frontmatter>("../../content/*.mdx", {
  eager: true,
  import: "metadata",
});

const readingTimeByPath = import.meta.glob<EssayReadingTime>(
  "../../content/*.mdx",
  { eager: true, import: "readingTime" }
);

function buildCatalog(): EssayListItem[] {
  return Object.entries(frontmatterByPath)
    .map(([path, frontmatter]) => {
      const readingTime = readingTimeByPath[path];
      if (!readingTime) {
        throw new Error(`Missing reading time for essay: ${path}`);
      }

      return {
        slug: essaySlugFromPath(path),
        metadata: {
          ...frontmatter,
          publishedAtFormatted: formatPublishedAt(
            parsePublishedAt(frontmatter.publishedAt)
          ),
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

/** Every essay in `content/`, newest first. */
export const essayCatalog: EssayListItem[] = buildCatalog();

export function getEssayBySlug(slug: string): EssayListItem | null {
  return essayCatalog.find((essay) => essay.slug === slug) ?? null;
}
