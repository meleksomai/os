import { getEssayBySlug } from "./catalog.server";
import { essaySlugFromPath } from "./slug";

const rawEssayByPath = import.meta.glob<string>("../../content/*.mdx", {
  eager: true,
  import: "default",
  query: "?raw",
});

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
