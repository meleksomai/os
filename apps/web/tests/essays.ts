import { readdirSync } from "node:fs";
import path from "node:path";
import { essaySlugFromPath } from "../src/server/essays/schema";

/** Slugs of every essay in content/, so tests never hardcode the list. */
export function essaySlugsOnDisk(): string[] {
  return readdirSync(path.join(import.meta.dirname, "../content"))
    .filter((file) => file.endsWith(".mdx"))
    .map(essaySlugFromPath)
    .sort();
}
