// apps/web/src/lib/essays.ts
// Isomorphic essay data layer backed by import.meta.glob over the compiled MDX
// modules. This file is intentionally free of node:fs (see essays.server.ts for
// the Node-only raw-markdown reader) so it can be safely pulled into both the
// SSR and client bundles by route loaders / components.
import type { JSX } from "react";
import { formatPublishedAt, parsePublishedAt } from "./date";

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

interface EssayModule {
  default: () => JSX.Element;
  metadata: Omit<Metadata, "publishedAtFormatted">;
  readingTime: { text: string; minutes: number; words: number };
}

// Serializable metadata (no React component) returned by route loaders.
export type EssayMeta = Omit<Essay, "Essay">;

// Lazy loaders (for async meta) + eager map (for sync component lookup in the route).
// Paths are relative to THIS file (src/lib/essays.ts).
const modules = import.meta.glob<EssayModule>("../content/essays/*.mdx");
const eagerForComponent = import.meta.glob<EssayModule>(
  "../content/essays/*.mdx",
  { eager: true }
);

const mdxRegex = /\.mdx$/;
const keyFor = (slug: string) => `../content/essays/${slug}.mdx`;
const slugFor = (key: string) =>
  key.replace("../content/essays/", "").replace(mdxRegex, "");

export function getEssaySlugs(): string[] {
  return Object.keys(modules).map(slugFor);
}

// Sync lookup for rendering the compiled component in the route component tree.
export function getEssayModule(slug: string) {
  const mod = eagerForComponent[keyFor(slug)];
  if (!mod) {
    throw new Error(`Post not found: ${slug}`);
  }
  return mod.default;
}

async function readEssayMeta(slug: string): Promise<EssayMeta> {
  const loader = modules[keyFor(slug)];
  if (!loader) {
    throw new Error(`Post not found: ${slug}`);
  }
  const mod = await loader();
  const date = parsePublishedAt(mod.metadata.publishedAt);
  return {
    slug,
    metadata: {
      ...mod.metadata,
      publishedAtFormatted: formatPublishedAt(date),
    },
    readingTime: mod.readingTime,
  };
}

export const getEssayMeta = readEssayMeta;

export async function getBlogEssays(): Promise<EssayMeta[]> {
  const all = await Promise.all(getEssaySlugs().map(readEssayMeta));
  return all.sort(
    (a, b) =>
      parsePublishedAt(b.metadata.publishedAt).getTime() -
      parsePublishedAt(a.metadata.publishedAt).getTime()
  );
}

export async function getFeaturedEssays(): Promise<EssayMeta[]> {
  return (await getBlogEssays()).filter((e) => e.metadata.featured);
}

// Full essay including the (non-serializable) compiled MDX component. For
// component-tree consumers — do NOT return this from a loader.
export async function getBlogEssay(slug: string): Promise<Essay> {
  const meta = await readEssayMeta(slug);
  return { ...meta, Essay: getEssayModule(slug) };
}
