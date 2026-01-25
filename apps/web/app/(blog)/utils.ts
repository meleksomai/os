import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { JSX } from "react";

import { formatPublishedAt, parsePublishedAt } from "@/lib/date";

export interface Metadata {
  title: string;
  subtitle: string;
  featured: boolean;
  publishedAt: string;
  publishedAtFormatted: string;
  audio?: string;
  image?: string;
  category: string;
}

export interface Essay {
  slug: string;
  metadata: Metadata;
  readingTime: {
    text: string;
    minutes: number;
    words: number;
  };
  Essay: () => JSX.Element;
}

const mdxRegex = /\.mdx$/;

function getMDXSlugs(dir: string) {
  return fs
    .readdirSync(dir)
    .filter((file) => path.extname(file) === ".mdx")
    .map((file) => file.replace(mdxRegex, ""));
}

async function readMDXFile(slug: string): Promise<Essay> {
  const {
    default: Essay,
    metadata,
    readingTime,
  } = await import(`@/app/(blog)/_content/${slug}.mdx`);

  const publishedAtDate = parsePublishedAt(metadata.publishedAt);
  const publishedAtFormatted = formatPublishedAt(publishedAtDate);

  return {
    slug,
    metadata: {
      ...metadata,
      publishedAt: metadata.publishedAt,
      publishedAtFormatted,
    },
    readingTime,
    Essay,
  };
}

function getMDXData(dir: string) {
  const slugs = getMDXSlugs(dir);
  const posts = Promise.all(slugs.map(async (slug) => await readMDXFile(slug)));
  return posts;
}

export async function getBlogEssays() {
  return (
    await getMDXData(path.join(process.cwd(), "app", "(blog)", "_content"))
  ).sort(
    (a, b) =>
      parsePublishedAt(b.metadata.publishedAt).getTime() -
      parsePublishedAt(a.metadata.publishedAt).getTime()
  );
}

export async function getBlogEssay(slug: string) {
  const posts = await getBlogEssays();
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }
  return post;
}

export async function getRawEssayMarkdown(slug: string): Promise<string> {
  // Reuse existing MDX parsing for metadata and reading time
  const { metadata, readingTime } = await getBlogEssay(slug);

  // Use gray-matter to properly parse the file
  const contentDir = path.join(process.cwd(), "app", "(blog)", "_content");
  const filePath = path.join(contentDir, `${slug}.mdx`);
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(rawContent);

  // Strip import statements from body
  const cleanedBody = content
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
    .join("\n")
    .trim();

  // Build formatted markdown using existing metadata and reading time
  return `# ${metadata.title} - ${metadata.subtitle}

/ ${metadata.publishedAtFormatted} / ${readingTime.text} / ${readingTime.words} words

---

${cleanedBody}
`;
}
