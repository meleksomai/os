// apps/web/src/lib/essays.server.ts
// Server-only raw-markdown reader. Kept in a `.server.ts` module (enforced by
// TanStack Start's import-protection) so it never reaches the client bundle.
// Only imported by server-route handlers and the request middleware
// (src/start.ts). Isomorphic meta helpers live in ./essays.
//
// The raw MDX source is pulled in via import.meta.glob({ query: '?raw' }) so it
// is bundled into the server output by Vite/Nitro. This avoids a runtime node:fs
// read against process.cwd() (which is the monorepo root, not apps/web, and
// where src/content is not shipped at all in the built server).
import matter from "gray-matter";
import { getEssayMeta } from "./essays";

const rawSources = import.meta.glob<string>("../content/essays/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
});

const importLinePrefix = "import ";
const keyFor = (slug: string) => `../content/essays/${slug}.mdx`;

export async function getRawEssayMarkdown(slug: string): Promise<string> {
  const { metadata, readingTime } = await getEssayMeta(slug);
  const rawContent = rawSources[keyFor(slug)];
  if (!rawContent) {
    throw new Error(`Post not found: ${slug}`);
  }
  const { content } = matter(rawContent);
  const cleanedBody = content
    .split("\n")
    .filter((line) => !line.trim().startsWith(importLinePrefix))
    .join("\n")
    .trim();
  return `# ${metadata.title} - ${metadata.subtitle}

/ ${metadata.publishedAtFormatted} / ${readingTime.text} / ${readingTime.words} words

---

${cleanedBody}
`;
}
