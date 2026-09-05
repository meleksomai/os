import { createFileRoute } from "@tanstack/react-router";
import { essayMarkdownResponse } from "@/server/essays/server";

export const Route = createFileRoute("/essay/{$slug}.md")({
  server: {
    handlers: {
      GET: ({ params }) => essayMarkdownResponse(params.slug),
    },
  },
});
