// Kept as an index route (folder) on purpose: the matcher ranks an index route
// above an equally specific leaf, so as a plain `{$slug}[.]md.ts` file this
// endpoint would lose `/essay/:slug.md` to the essay page's index route.
import { createFileRoute } from "@tanstack/react-router";
import { essayMarkdownResponse } from "@/essays/markdown.server";

export const Route = createFileRoute("/essay/{$slug}.md/")({
  server: {
    handlers: {
      GET: ({ params }) => essayMarkdownResponse(params.slug),
    },
  },
});
