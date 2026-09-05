import { allEssays, type Essay as EssayDocument } from "content-collections";
import type { Essay } from "./schema";

/** Every essay in `content/`, newest first (content-collections.ts builds and validates them). */
const essays = [...allEssays].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);

function toEssay({ markdown: _markdown, ...essay }: EssayDocument): Essay {
  return essay;
}

export function listEssays(): Essay[] {
  return essays.map(toEssay);
}

export function getEssayBySlug(slug: string): Essay | null {
  const essay = essays.find((candidate) => candidate.slug === slug);
  return essay ? toEssay(essay) : null;
}

/**
 * Plain-markdown rendition of an essay for user agents that ask for
 * text/markdown: the title heading, a metadata line, then the body the
 * collection produced from the MDX source (mdx-to-markdown.ts).
 */
export function getEssayMarkdown(slug: string): string | null {
  const essay = essays.find((candidate) => candidate.slug === slug);

  if (!essay) {
    return null;
  }

  const { title, subtitle, publishedAtFormatted, readingTime, markdown } =
    essay;

  return `# ${title} - ${subtitle}

/ ${publishedAtFormatted} / ${readingTime.text} / ${readingTime.words} words

---

${markdown}
`;
}
