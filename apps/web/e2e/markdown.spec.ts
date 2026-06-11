/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

const AGENTS_HEADING =
  "# Agent-First Systems and the Future of Software - On harnesses, verifiability, and why human-in-the-loop is not the answer for safe AI agents";

test.describe("essay markdown endpoints", () => {
  test("GET /essay/:slug/md serves raw markdown", async ({ request }) => {
    const response = await request.get("/essay/agents/md");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(MARKDOWN_CONTENT_TYPE);

    const body = await response.text();
    expect(body.startsWith(AGENTS_HEADING)).toBe(true);
    expect(body).toContain("min read");
    // Frontmatter and MDX imports are stripped
    expect(body).not.toContain("publishedAt:");
    expect(body).not.toContain("import { Quote }");
  });

  test("GET /essay/:slug.md rewrites to the markdown rendition", async ({
    request,
  }) => {
    const response = await request.get("/essay/agents.md");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(MARKDOWN_CONTENT_TYPE);
    expect((await response.text()).startsWith(AGENTS_HEADING)).toBe(true);
  });

  test("Accept: text/markdown on the essay URL negotiates markdown", async ({
    request,
  }) => {
    const response = await request.get("/essay/agents", {
      headers: { accept: "text/markdown" },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(MARKDOWN_CONTENT_TYPE);
    expect((await response.text()).startsWith(AGENTS_HEADING)).toBe(true);
  });

  test("Accept: text/plain on the essay URL negotiates markdown", async ({
    request,
  }) => {
    const response = await request.get("/essay/agents", {
      headers: { accept: "text/plain" },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe(MARKDOWN_CONTENT_TYPE);
  });

  test("browser Accept header still receives HTML", async ({ request }) => {
    const response = await request.get("/essay/agents", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(await response.text()).toContain("<article");
  });

  test("every essay has a working markdown rendition", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const slugs = [...xml.matchAll(/\/essay\/([^<]+)<\/loc>/g)].map(
      (m) => m[1] ?? ""
    );

    expect(slugs.length).toBeGreaterThanOrEqual(8);

    for (const slug of slugs) {
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

    const negotiated = await request.get("/essay/does-not-exist", {
      headers: { accept: "text/markdown" },
    });
    expect(negotiated.status()).toBe(404);
  });
});
