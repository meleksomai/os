// apps/web/src/start.ts
// TanStack Start instance: registers the global request middleware that
// reimplements the `.md` content negotiation the old Next.js proxy.ts provided.
//
// Original behavior (proxy.ts):
//   - /essay/<slug>.md            -> raw markdown
//   - Accept: text/markdown|plain -> raw markdown for /essay/<slug>
// The literal `.md` URL is served by the dedicated route src/routes/essay.$slug[.]md.ts;
// this middleware adds the Accept-header branch for the canonical /essay/<slug> URL,
// since server-route handlers in @tanstack/react-start 1.168.18 do not receive a
// `next()` to fall through to HTML SSR.
//
// NOTE: defining src/start.ts opts out of Start's automatic CSRF middleware for
// server functions, so we re-add createCsrfMiddleware() explicitly to keep the
// existing server functions (newsletter/wishes) protected. Without this, those
// same-origin RPC endpoints would lose CSRF protection.
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";
import { getRawEssayMarkdown } from "./lib/essays.server";

// Matches /essay/<slug> and /essay/<slug>.md (single path segment for the slug),
// mirroring the original proxy matcher ["/essay/:slug", "/essay/:slug.md"].
const ESSAY_PATH_REGEX = /^\/essay\/([^/]+?)(\.md)?\/?$/;

const markdownNegotiationMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const url = new URL(request.url);
    const match =
      request.method === "GET" ? url.pathname.match(ESSAY_PATH_REGEX) : null;

    if (match) {
      const slug = match[1];
      const isMdUrl = Boolean(match[2]);
      const accept = request.headers.get("accept") ?? "";
      const prefersMarkdown =
        isMdUrl ||
        accept.includes("text/markdown") ||
        accept.includes("text/plain");

      if (prefersMarkdown) {
        try {
          const markdown = await getRawEssayMarkdown(slug);
          return new Response(markdown, {
            headers: { "Content-Type": "text/markdown; charset=utf-8" },
          });
        } catch {
          // Unknown slug -> 404 (matches the original md route handler).
          return new Response("Essay not found", { status: 404 });
        }
      }
    }

    // Not an essay markdown request: fall through to normal SSR / server routes.
    return next();
  }
);

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, markdownNegotiationMiddleware],
}));
