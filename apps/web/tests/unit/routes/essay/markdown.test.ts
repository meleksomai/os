import { describe, expect, it } from "vitest";
import { markdownResponse, prefersMarkdown } from "@/routes/essay/-markdown";
import { getEssayMarkdown } from "@/server/essays/server";

// The route only wraps the domain's rendition in a response.
const rendition = getEssayMarkdown("agents") ?? "";

function requestAccepting(accept: string): Request {
  return new Request("https://www.somai.me/essay/agents", {
    headers: { Accept: accept },
  });
}

describe("prefersMarkdown", () => {
  it("is true for agents asking for markdown or plain text", () => {
    expect(prefersMarkdown(requestAccepting("text/markdown"))).toBe(true);
    expect(prefersMarkdown(requestAccepting("text/plain, */*"))).toBe(true);
  });

  it("is false for browsers and for requests without an Accept header", () => {
    expect(prefersMarkdown(requestAccepting("text/html,*/*;q=0.8"))).toBe(
      false
    );
    expect(
      prefersMarkdown(new Request("https://www.somai.me/essay/agents"))
    ).toBe(false);
  });
});

describe("markdownResponse", () => {
  it("returns the rendition with the markdown content type and extra headers", async () => {
    const response = markdownResponse("agents", { Vary: "Accept" });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(response.headers.get("Vary")).toBe("Accept");
    expect(await response.text()).toBe(rendition);
  });

  it("returns a plain-text 404 for unknown essays", async () => {
    const response = markdownResponse("does-not-exist");

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8"
    );
    expect(await response.text()).toBe("Essay not found");
  });
});
