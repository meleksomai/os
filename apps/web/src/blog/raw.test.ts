/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { describe, expect, it } from "vitest";
import { essayCatalog } from "./catalog.server";
import { essayMarkdownResponse, getRawEssayMarkdown } from "./raw.server";

describe("getRawEssayMarkdown", () => {
  it("renders the same document shape as the previous /md route", () => {
    const markdown = getRawEssayMarkdown("agents");

    expect(markdown).not.toBeNull();
    const lines = (markdown as string).split("\n");
    expect(lines[0]).toBe(
      "# Agent-First Systems and the Future of Software - On harnesses, verifiability, and why human-in-the-loop is not the answer for safe AI agents"
    );
    expect(lines[2]).toMatch(
      /^\/ January 2, 2026 \/ \d+ min read \/ \d+ words$/
    );
    expect(lines[4]).toBe("---");
  });

  it("strips frontmatter and import statements", () => {
    for (const essay of essayCatalog) {
      const markdown = getRawEssayMarkdown(essay.slug);
      expect(markdown).not.toBeNull();
      expect(markdown).not.toContain("publishedAt:");
      const body = (markdown as string).split("---").slice(1).join("---");
      const importLines = body
        .split("\n")
        .filter((line) => line.startsWith("import "));
      expect(importLines).toEqual([]);
    }
  });

  it("returns null for an unknown slug", () => {
    expect(getRawEssayMarkdown("does-not-exist")).toBeNull();
  });
});

describe("essayMarkdownResponse", () => {
  it("returns markdown with the right content type", async () => {
    const response = essayMarkdownResponse("agents");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(await response.text()).toContain("Agent-First Systems");
  });

  it("returns 404 for unknown essays", async () => {
    const response = essayMarkdownResponse("does-not-exist");

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Essay not found");
  });
});
