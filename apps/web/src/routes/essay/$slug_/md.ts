// The `_` suffix on the folder keeps this endpoint a sibling of the essay page
// rather than a child of it, so the page's GET handler does not sit in front
// of it: https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing#non-nested-routes
import { createFileRoute } from "@tanstack/react-router";
import { essayMarkdownResponse } from "@/essays/markdown.server";

export const Route = createFileRoute("/essay/$slug_/md")({
  server: {
    handlers: {
      GET: ({ params }) => essayMarkdownResponse(params.slug),
    },
  },
});
