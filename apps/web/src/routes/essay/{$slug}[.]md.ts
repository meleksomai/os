import { createFileRoute } from "@tanstack/react-router";
import { essayMarkdownResponse } from "@/essays/markdown.server";

export const Route = createFileRoute("/essay/{$slug}.md")({
  server: {
    handlers: {
      GET: ({ params }) => essayMarkdownResponse(params.slug),
    },
  },
});
