import { formatPublishedAt, parsePublishedAt } from "@/lib/date";
import {
  type EssayListItem,
  type EssayMetadata,
  type EssayReadingTime,
  essaySlugFromPath,
} from "./schema";

type Frontmatter = Omit<EssayMetadata, "publishedAtFormatted">;

// Only the named exports produced by the MDX pipeline (remark-mdx-frontmatter
// and remark-reading-time) are imported here, so this module never renders an
// essay. The components live in src/components/essays/content.tsx.
const frontmatterByPath = import.meta.glob<Frontmatter>(
  "../../../content/*.mdx",
  { eager: true, import: "metadata" }
);

const readingTimeByPath = import.meta.glob<EssayReadingTime>(
  "../../../content/*.mdx",
  { eager: true, import: "readingTime" }
);

const rawEssayByPath = import.meta.glob<string>("../../../content/*.mdx", {
  eager: true,
  import: "default",
  query: "?raw",
});

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

const catalog = buildCatalog();

/** Every essay in `content/`, newest first. */
export function listEssays(): EssayListItem[] {
  return catalog;
}

export function getEssayBySlug(slug: string): EssayListItem | null {
  return catalog.find((essay) => essay.slug === slug) ?? null;
}

const rawEssayBySlug = new Map(
  Object.entries(rawEssayByPath).map(([path, raw]) => [
    essaySlugFromPath(path),
    raw,
  ])
);

// The YAML block at the top of every essay. Its values reach the app through
// the catalog, so the rendition only needs to drop it.
const FRONTMATTER_BLOCK = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/**
 * Plain-markdown rendition of an essay for user agents that ask for
 * text/markdown: the title heading, a metadata line, then the body with the
 * frontmatter and the MDX import statements stripped.
 */
export function getEssayMarkdown(slug: string): string | null {
  const essay = getEssayBySlug(slug);
  const raw = rawEssayBySlug.get(slug);

  if (!(essay && raw)) {
    return null;
  }

  const body = raw
    .replace(FRONTMATTER_BLOCK, "")
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
    .join("\n")
    .trim();

  const { metadata, readingTime } = essay;

  return `# ${metadata.title} - ${metadata.subtitle}

/ ${metadata.publishedAtFormatted} / ${readingTime.text} / ${readingTime.words} words

---

${body}
`;
}

function markdownResponse(markdown: string): Response {
  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export function essayMarkdownResponse(slug: string): Response {
  const markdown = getEssayMarkdown(slug);

  if (markdown === null) {
    return new Response("Essay not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return markdownResponse(markdown);
}
