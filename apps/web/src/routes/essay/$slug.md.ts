// By TanStack's naming this route nests under the essay page (`$slug.tsx`),
// which has no server handler of its own.
import { createFileRoute } from "@tanstack/react-router";
import { markdownResponse } from "./-markdown";

export const Route = createFileRoute("/essay/$slug/md")({
  server: {
    handlers: {
      GET: ({ params }) => markdownResponse(params.slug),
    },
  },
});
