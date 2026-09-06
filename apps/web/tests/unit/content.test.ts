import { allEssays, research } from "content-collections";
import { describe, expect, it } from "vitest";
import { essaySlugsOnDisk } from "../essays";

const YEAR_AT_END = /\d{4}$/;
const READING_TIME = /min read/;
const YEAR = /^\d{4}$/;

describe("content collection", () => {
  it("has one essay per file in content/, with the derived fields and its page component", () => {
    expect(allEssays.map((essay) => essay.slug).sort()).toEqual(
      essaySlugsOnDisk()
    );
    for (const essay of allEssays) {
      expect(essay.publishedAtFormatted, essay.slug).toMatch(YEAR_AT_END);
      expect(essay.readingTime.text, essay.slug).toMatch(READING_TIME);
      expect(typeof essay.mdx, essay.slug).toBe("function");
    }
  });

  it("has at least one featured essay for the home page", () => {
    expect(allEssays.some((essay) => essay.featured)).toBe(true);
  });

  it("exposes every paper of content/papers.json with the fields the page renders", () => {
    expect(research.papers).toHaveLength(20);
    for (const paper of research.papers) {
      expect(paper.title, paper._id).toBeTruthy();
      expect(paper.published.year, paper.title).toMatch(YEAR);
    }
  });
});
