import { createFileRoute } from "@tanstack/react-router";

/** The previous site's /essay/:slug/md address; the rendition lives at /essay/:slug.md. */
export const Route = createFileRoute("/essay/$slug/md")({
  server: {
    handlers: {
      GET: ({ params }) =>
        new Response(null, {
          status: 308,
          headers: { Location: `/essay/${params.slug}.md` },
        }),
    },
  },
});
