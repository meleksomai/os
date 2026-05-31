// apps/web/src/routes/essay.$slug[.]md.ts -> /essay/$slug.md
// Dedicated raw-markdown server route for the literal `.md` URL. Replaces the
// Next.js app/(blog)/essay/[slug]/md/route.ts handler. The Accept-header
// negotiation for the canonical /essay/$slug URL is handled by the global
// request middleware in src/start.ts (server-route handlers do not receive a
// `next()` to fall through to HTML SSR in @tanstack/react-start 1.168.18).
import { createFileRoute } from "@tanstack/react-router";
import { getRawEssayMarkdown } from "../lib/essays.server";

// The router parses the whole `$slug.md` segment as a single param (named
// "slug.md"), so we derive the clean slug from the request pathname instead of
// params.slug. In practice the global middleware in src/start.ts intercepts the
// `.md` URL first; this dedicated route is the fallback for the literal URL.
const SLUG_FROM_MD_PATH = /\/essay\/(.+)\.md$/;

export const Route = createFileRoute("/essay/$slug.md")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { pathname } = new URL(request.url);
        const slug = SLUG_FROM_MD_PATH.exec(pathname)?.[1];
        if (!slug) {
          return new Response("Essay not found", { status: 404 });
        }
        try {
          const markdown = await getRawEssayMarkdown(slug);
          return new Response(markdown, {
            headers: { "Content-Type": "text/markdown; charset=utf-8" },
          });
        } catch {
          // Unknown slug -> getRawEssayMarkdown throws; mirror the original 404.
          return new Response("Essay not found", { status: 404 });
        }
      },
    },
  },
});
