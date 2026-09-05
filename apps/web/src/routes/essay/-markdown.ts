import { getEssayMarkdown } from "@/server/essays/server";

/** Whether a user agent asked for the markdown rendition rather than the page. */
export function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/markdown") || accept.includes("text/plain");
}

/** The markdown rendition of an essay as a response, or a plain-text 404. */
export function markdownResponse(
  slug: string,
  headers: Record<string, string> = {}
): Response {
  const markdown = getEssayMarkdown(slug);

  if (markdown === null) {
    return new Response("Essay not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", ...headers },
    });
  }

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", ...headers },
  });
}
