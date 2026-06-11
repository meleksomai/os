import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/essay/$slug/md")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { essayMarkdownResponse } = await import("@/blog/raw.server");
        return essayMarkdownResponse(params.slug);
      },
    },
  },
});
