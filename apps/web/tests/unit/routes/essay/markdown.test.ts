import { describe, expect, it } from "vitest";
import { markdownResponse } from "@/routes/essay/-markdown";
import { getEssayMarkdown } from "@/server/essays/server";

// The route only wraps the domain's rendition in a response.
const rendition = getEssayMarkdown("agents") ?? "";

describe("markdownResponse", () => {
  it("returns the rendition with the markdown content type", async () => {
    const response = markdownResponse("agents");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8"
    );
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
