/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parsePublishedAt } from "@/lib/date";
import { essayCatalog, getEssayBySlug } from "./catalog.server";
import { essaySlugFromPath } from "./slug";

const slugsOnDisk = readdirSync(path.join(import.meta.dirname, "../../content"))
  .filter((file) => file.endsWith(".mdx"))
  .map(essaySlugFromPath)
  .sort();

describe("essayCatalog", () => {
  it("contains exactly the essays in content/", () => {
    expect(slugsOnDisk).toContain("agents");
    expect(essayCatalog.map((essay) => essay.slug).sort()).toEqual(slugsOnDisk);
  });

  it("is sorted by publishedAt descending", () => {
    const dates = essayCatalog.map((essay) =>
      parsePublishedAt(essay.metadata.publishedAt).getTime()
    );
    const sorted = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sorted);
  });

  it("exposes complete metadata for every essay", () => {
    for (const essay of essayCatalog) {
      expect(essay.metadata.title).toBeTruthy();
      expect(essay.metadata.subtitle).toBeTruthy();
      expect(essay.metadata.category).toBeTruthy();
      expect(essay.metadata.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(essay.metadata.publishedAtFormatted).toMatch(/\d{4}$/);
      expect(typeof essay.metadata.featured).toBe("boolean");
    }
  });

  it("exposes reading time for every essay", () => {
    for (const essay of essayCatalog) {
      expect(essay.readingTime.text).toMatch(/min read/);
      expect(essay.readingTime.words).toBeGreaterThan(0);
    }
  });

  it("has at least one featured essay for the home page", () => {
    expect(
      essayCatalog.filter((essay) => essay.metadata.featured).length
    ).toBeGreaterThan(0);
  });
});

describe("getEssayBySlug", () => {
  it("returns the essay for a known slug", () => {
    const essay = getEssayBySlug("agents");
    expect(essay?.metadata.title).toBe(
      "Agent-First Systems and the Future of Software"
    );
  });

  it("returns null for an unknown slug", () => {
    expect(getEssayBySlug("does-not-exist")).toBeNull();
  });
});
