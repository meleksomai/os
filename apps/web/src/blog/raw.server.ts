import matter from "gray-matter";
import { essaySlugFromPath, getEssayBySlug } from "./catalog.server";

const rawEssayByPath = import.meta.glob("../../content/*.mdx", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const rawEssayBySlug = new Map(
  Object.entries(rawEssayByPath).map(([path, raw]) => [
    essaySlugFromPath(path),
    raw,
  ])
);

/**
 * Plain-markdown rendition of an essay, served to user agents that ask for
 * text/markdown. Mirrors the formatting of the previous /essay/[slug]/md
 * route handler: title heading, metadata line, then the essay body with
 * frontmatter and MDX import statements stripped.
 */
export function getRawEssayMarkdown(slug: string): string | null {
  const essay = getEssayBySlug(slug);
  const raw = rawEssayBySlug.get(slug);

  if (!(essay && raw)) {
    return null;
  }

  const { content } = matter(raw);

  const cleanedBody = content
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
    .join("\n")
    .trim();

  const { metadata } = essay;

  return `# ${metadata.title} - ${metadata.subtitle}

/ ${metadata.publishedAtFormatted} / ${essay.readingTime.text} / ${essay.readingTime.words} words

---

${cleanedBody}
`;
}

export function essayMarkdownResponse(slug: string): Response {
  const markdown = getRawEssayMarkdown(slug);

  if (markdown === null) {
    return new Response("Essay not found", { status: 404 });
  }

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
