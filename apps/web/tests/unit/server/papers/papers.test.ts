import { describe, expect, it } from "vitest";
import { listPapers } from "@/server/papers/server";

const YEAR = /^\d{4}$/;

describe("listPapers", () => {
  it("exposes every record of content/papers.json with the fields the page renders", () => {
    const papers = listPapers();

    expect(papers).toHaveLength(20);
    for (const paper of papers) {
      expect(paper._id, paper.title).toBeTruthy();
      expect(paper.title).toBeTruthy();
      expect(paper.published.year).toMatch(YEAR);
      expect(Object.keys(paper).sort()).toEqual([
        "_id",
        "doi",
        "published",
        "publisher",
        "title",
        "url",
      ]);
    }
  });
});
