import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { essaySlugsOnDisk } from "../essays";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

// The checked-in rendition of content/agents.mdx (see the unit test markdown.test.ts).
const AGENTS_RENDITION = readFileSync(
  new URL("../fixtures/agents.md", import.meta.url),
  "utf8"
);

test.describe("essay markdown endpoints", () => {
  test("GET /essay/:slug/md serves the raw markdown", async ({ request }) => {
    const response = await request.get("/essay/agents/md");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(MARKDOWN_CONTENT_TYPE);
    expect(await response.text()).toBe(AGENTS_RENDITION);
  });

  test("GET /essay/:slug.md serves the same rendition", async ({ request }) => {
    const response = await request.get("/essay/agents.md");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(MARKDOWN_CONTENT_TYPE);
    expect(await response.text()).toBe(AGENTS_RENDITION);
  });

  test("every essay has a working markdown rendition", async ({ request }) => {
    for (const slug of essaySlugsOnDisk()) {
      const response = await request.get(`/essay/${slug}/md`);
      expect(response.status(), `/essay/${slug}/md`).toBe(200);
      expect((await response.text()).startsWith("# ")).toBe(true);
    }
  });

  test("unknown essays return 404 on all markdown endpoints", async ({
    request,
  }) => {
    const mdRoute = await request.get("/essay/does-not-exist/md");
    expect(mdRoute.status()).toBe(404);
    expect(await mdRoute.text()).toBe("Essay not found");

    const mdExtension = await request.get("/essay/does-not-exist.md");
    expect(mdExtension.status()).toBe(404);
  });
});
