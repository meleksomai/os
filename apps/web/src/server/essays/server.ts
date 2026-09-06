import { allEssays, allRenditions, type Essay } from "content-collections";

/** Every essay in `content/`, newest first (content-collections.ts builds and validates them). */
const essays = [...allEssays].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);

export function listEssays(): Essay[] {
  return essays;
}

export function getEssayBySlug(slug: string): Essay | null {
  return essays.find((essay) => essay.slug === slug) ?? null;
}

/**
 * Plain-markdown rendition of an essay for user agents: the title heading, a
 * metadata line, then the body the collection produced from the MDX source
 * (mdx-to-markdown.ts).
 */
export function getEssayMarkdown(slug: string): string | null {
  const essay = getEssayBySlug(slug);
  const rendition = allRenditions.find((candidate) => candidate.slug === slug);

  if (!(essay && rendition)) {
    return null;
  }

  const { title, subtitle, publishedAtFormatted, readingTime } = essay;

  return `# ${title} - ${subtitle}

/ ${publishedAtFormatted} / ${readingTime.text} / ${readingTime.words} words

---

${rendition.markdown}
`;
}
