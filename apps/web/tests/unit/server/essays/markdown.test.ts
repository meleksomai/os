import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getEssayMarkdown, listEssays } from "@/server/essays/server";

const JSX_TAG = /<[A-Z][A-Za-z]*[\s/>]/;
const UI_IMPORT = /^import .* from "@workspace\/ui/m;
const FENCED_CODE = /```[\s\S]*?```/g;
const FENCE_WITH_IMPORT = /```[^\n]*\n[\s\S]*?^import /m;

// The rendition of content/agents.mdx as produced by content-collections.ts
// (mdx-to-markdown.ts), reviewed against the previous deployment's output on
// 2026-09-05. Regenerate it on purpose when the conversion changes:
//   pnpm build && pnpm preview & curl -s http://localhost:4173/essay/agents.md > tests/fixtures/agents.md
const checkedInRendition = readFileSync(
  path.join(import.meta.dirname, "../../../fixtures/agents.md"),
  "utf8"
);

describe("getEssayMarkdown", () => {
  it("matches the checked-in rendition", () => {
    expect(getEssayMarkdown("agents")).toBe(checkedInRendition);
  });

  it("renders every essay as plain markdown", () => {
    for (const essay of listEssays()) {
      const markdown = getEssayMarkdown(essay.slug);
      expect(markdown, essay.slug).not.toBeNull();
      expect(markdown).toContain(`# ${essay.title} - ${essay.subtitle}`);
      expect(markdown).toContain(
        `/ ${essay.publishedAtFormatted} / ${essay.readingTime.text} /`
      );
      expect(markdown, essay.slug).not.toContain("publishedAt:");
      // Prose only: code blocks may legitimately contain `<Env>` or imports.
      const prose = (markdown ?? "").replace(FENCED_CODE, "");
      expect(prose, essay.slug).not.toMatch(JSX_TAG);
      expect(prose, essay.slug).not.toMatch(UI_IMPORT);
    }
  });

  it("returns null for an unknown slug", () => {
    expect(getEssayMarkdown("does-not-exist")).toBeNull();
  });
});
