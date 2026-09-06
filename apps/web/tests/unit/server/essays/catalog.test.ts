/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { describe, expect, it } from "vitest";
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
    // ISO dates sort lexicographically.
    const dates = listEssays().map((essay) => essay.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
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
