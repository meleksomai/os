import { createFileRoute } from "@tanstack/react-router";
import { getEssayMarkdown } from "@/server/essays/server";

/**
 * The plain-markdown rendition of an essay, for agents: /essay/:slug.md
 * (built from the MDX source by the content collection). Negotiating it on
 * the page URL is tracked in https://github.com/meleksomai/os/issues/101.
 */
export const Route = createFileRoute("/essay/{$slug}.md")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const markdown = getEssayMarkdown(params.slug);

        if (markdown === null) {
          return new Response("Essay not found", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        return new Response(markdown, {
          headers: { "Content-Type": "text/markdown; charset=utf-8" },
        });
      },
    },
  },
});
