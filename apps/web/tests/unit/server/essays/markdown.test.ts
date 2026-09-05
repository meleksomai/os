import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getEssayMarkdown, listEssays } from "@/server/essays/server";

const IMPORT_LINE = /^import /m;

// Captured from the previous deployment on 2026-09-04:
//   curl -s https://www.somai.me/essay/agents/md > tests/fixtures/agents.md
const productionRendition = readFileSync(
  path.join(import.meta.dirname, "../../../fixtures/agents.md"),
  "utf8"
);

describe("getEssayMarkdown", () => {
  it("is byte-identical to the production rendition", () => {
    expect(getEssayMarkdown("agents")).toBe(productionRendition);
  });

  it("strips the frontmatter and import statements from every essay", () => {
    for (const essay of listEssays()) {
      const markdown = getEssayMarkdown(essay.slug);
      expect(markdown, essay.slug).not.toBeNull();
      expect(markdown).toContain(`# ${essay.title}`);
      expect(markdown).not.toContain("publishedAt:");
      expect(markdown).not.toMatch(IMPORT_LINE);
    }
  });

  it("returns null for an unknown slug", () => {
    expect(getEssayMarkdown("does-not-exist")).toBeNull();
  });
});
