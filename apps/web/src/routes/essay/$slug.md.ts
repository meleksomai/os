// By TanStack's naming this route nests under the essay page (`$slug.tsx`),
// whose GET handler passes browsers through with `next()`.
import { createFileRoute } from "@tanstack/react-router";
import { essayMarkdownResponse } from "@/essays/markdown.server";

export const Route = createFileRoute("/essay/$slug/md")({
  server: {
    handlers: {
      GET: ({ params }) => essayMarkdownResponse(params.slug),
    },
  },
});
