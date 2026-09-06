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
