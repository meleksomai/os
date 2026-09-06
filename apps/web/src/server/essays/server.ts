import { allEssays, type Essay } from "content-collections";

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
