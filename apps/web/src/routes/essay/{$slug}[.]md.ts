import { createFileRoute } from "@tanstack/react-router";
import { markdownResponse } from "./-markdown";

export const Route = createFileRoute("/essay/{$slug}.md")({
  server: {
    handlers: {
      GET: ({ params }) => markdownResponse(params.slug),
    },
  },
});
