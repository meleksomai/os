import { readdirSync } from "node:fs";
import { essaySlugFromPath } from "../../src/essays/slug";

/** Slugs of every essay in content/, so specs never hardcode the list. */
export function essaySlugsOnDisk(): string[] {
  return readdirSync(new URL("../../content/", import.meta.url))
    .filter((file) => file.endsWith(".mdx"))
    .map(essaySlugFromPath)
    .sort();
}
