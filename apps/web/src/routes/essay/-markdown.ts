import { getEssayMarkdown } from "@/server/essays/server";

/**
 * The markdown rendition of an essay as a response, or a plain-text 404.
 * Served at /essay/:slug/md and /essay/:slug.md; negotiating it on the page
 * URL itself is tracked in https://github.com/meleksomai/os/issues/101.
 */
export function markdownResponse(slug: string): Response {
  const markdown = getEssayMarkdown(slug);

  if (markdown === null) {
    return new Response("Essay not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
