import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { essayCatalog } from "./catalog.server";
import { essayMarkdownResponse, getEssayMarkdown } from "./markdown.server";

const IMPORT_LINE = /^import /m;

// Captured from the previous deployment on 2026-09-04:
//   curl -s https://www.somai.me/essay/agents/md > src/essays/__fixtures__/agents.md
const productionRendition = readFileSync(
  path.join(import.meta.dirname, "__fixtures__/agents.md"),
  "utf8"
);

describe("getEssayMarkdown", () => {
  it("is byte-identical to the production rendition", () => {
    expect(getEssayMarkdown("agents")).toBe(productionRendition);
  });

  it("strips the frontmatter and import statements from every essay", () => {
    for (const essay of essayCatalog) {
      const markdown = getEssayMarkdown(essay.slug);
      expect(markdown, essay.slug).not.toBeNull();
      expect(markdown).toContain(`# ${essay.metadata.title}`);
      expect(markdown).not.toContain("publishedAt:");
      expect(markdown).not.toMatch(IMPORT_LINE);
    }
  });

  it("returns null for an unknown slug", () => {
    expect(getEssayMarkdown("does-not-exist")).toBeNull();
  });
});

describe("essayMarkdownResponse", () => {
  it("returns markdown with the right content type", async () => {
    const response = essayMarkdownResponse("agents");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(await response.text()).toBe(productionRendition);
  });

  it("returns a plain-text 404 for unknown essays", async () => {
    const response = essayMarkdownResponse("does-not-exist");

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8"
    );
    expect(await response.text()).toBe("Essay not found");
  });
});
