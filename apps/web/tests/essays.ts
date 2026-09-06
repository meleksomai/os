import { readdirSync } from "node:fs";
import path from "node:path";

const MDX_EXTENSION = /\.mdx$/;

/** Slugs of every essay in content/, so tests never hardcode the list. */
export function essaySlugsOnDisk(): string[] {
  return readdirSync(path.join(import.meta.dirname, "../content"))
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(MDX_EXTENSION, ""))
    .sort();
}
