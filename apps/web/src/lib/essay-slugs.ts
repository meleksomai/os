// apps/web/src/lib/essay-slugs.ts
// Node fs read — EDGE-INCOMPATIBLE (config/build time only, Node preset assumed).
import fs from "node:fs";
import path from "node:path";

const mdxRegex = /\.mdx$/;

export function getEssaySlugsSync(): string[] {
  const dir = path.join(process.cwd(), "src", "content", "essays");
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(mdxRegex, ""));
}
