/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { describe, expect, it } from "vitest";
import { parsePublishedAt } from "@/lib/date";
import { getEssayBySlug, listEssays } from "@/server/essays/server";
import { essaySlugsOnDisk } from "../../../essays";

const slugsOnDisk = essaySlugsOnDisk();

describe("listEssays", () => {
  it("contains exactly the essays in content/", () => {
    expect(slugsOnDisk).toContain("agents");
    expect(
      listEssays()
        .map((essay) => essay.slug)
        .sort()
    ).toEqual(slugsOnDisk);
  });

  it("is sorted by publishedAt descending", () => {
    const dates = listEssays().map((essay) =>
      parsePublishedAt(essay.publishedAt).getTime()
    );
    const sorted = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sorted);
  });

  it("exposes complete metadata for every essay", () => {
    for (const essay of listEssays()) {
      expect(essay.title).toBeTruthy();
      expect(essay.subtitle).toBeTruthy();
      expect(essay.category).toBeTruthy();
      expect(essay.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(essay.publishedAtFormatted).toMatch(/\d{4}$/);
      expect(typeof essay.featured).toBe("boolean");
    }
  });

  it("exposes reading time for every essay", () => {
    for (const essay of listEssays()) {
      expect(essay.readingTime.text).toMatch(/min read/);
      expect(essay.readingTime.words).toBeGreaterThan(0);
    }
  });

  it("has at least one featured essay for the home page", () => {
    expect(
      listEssays().filter((essay) => essay.featured).length
    ).toBeGreaterThan(0);
  });
});

describe("getEssayBySlug", () => {
  it("returns the essay for a known slug", () => {
    const essay = getEssayBySlug("agents");
    expect(essay?.title).toBe("Agent-First Systems and the Future of Software");
  });

  it("returns null for an unknown slug", () => {
    expect(getEssayBySlug("does-not-exist")).toBeNull();
  });
});
