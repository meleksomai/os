/** biome-ignore-all lint/performance/useTopLevelRegex: e2e assertions */
import { expect, test } from "@playwright/test";

const BROWSER_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
};

test("essay body is rendered inline in the HTML, not streamed later", async ({
  request,
}) => {
  const response = await request.get("/essay/agents", {
    headers: BROWSER_HEADERS,
  });
  const html = await response.text();

  // A pending Suspense boundary would leave a <template id="B:…"> placeholder
  // and append the body in a hidden <div> at the end of the document.
  expect(html).not.toContain('<template id="B:');

  const article = html.slice(
    html.indexOf("<article"),
    html.indexOf("</article>")
  );
  expect(article).toContain("Over the holidays");
});

test("essay responses vary on Accept", async ({ request }) => {
  const html = await request.get("/essay/agents", { headers: BROWSER_HEADERS });
  expect(html.headers().vary).toContain("Accept");

  const markdown = await request.get("/essay/agents", {
    headers: { accept: "text/markdown" },
  });
  expect(markdown.headers().vary).toContain("Accept");
});

test("essays serve HTML for Accept values that are neither HTML nor markdown", async ({
  request,
}) => {
  const response = await request.get("/essay/agents", {
    headers: { accept: "application/json" },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/html");
});

test("pages without a markdown rendition still serve HTML to markdown-first agents", async ({
  request,
}) => {
  for (const path of ["/", "/essays", "/papers", "/baby"]) {
    const response = await request.get(path, {
      headers: { accept: "text/markdown" },
    });
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toContain("text/html");
  }
});

test("trailing slashes redirect permanently to the canonical URL", async ({
  request,
}) => {
  for (const [path, canonical] of [
    ["/essays/", "/essays"],
    ["/essay/agents/", "/essay/agents"],
    ["/essay/agents/md/", "/essay/agents/md"],
  ]) {
    const response = await request.get(path ?? "", { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    expect(new URL(response.headers().location ?? "").pathname).toBe(canonical);
  }
});

test("fingerprinted assets are immutable while images revalidate", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  const asset = html.match(/\/assets\/[^"']+\.js/)?.[0];
  expect(asset).toBeTruthy();

  const script = await request.get(asset ?? "");
  expect(script.status()).toBe(200);
  expect(script.headers()["cache-control"]).toContain("immutable");

  const image = await request.get("/og/home.png");
  expect(image.status()).toBe(200);
  expect(image.headers()["cache-control"]).not.toContain("immutable");
});
