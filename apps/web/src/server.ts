import handler from "@tanstack/react-start/server-entry";
import { prefersMarkdown } from "@/essays/negotiation";

const TRAILING_SLASHES = /\/+$/;
const ESSAY_PAGE = /^\/essay\/[^/]+$/;
const SERVER_FN_BASE = "/_serverFn/";

function acceptsHtml(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return (
    accept === "" || accept.includes("text/html") || accept.includes("*/*")
  );
}

// Custom Worker entrypoint (wrangler.jsonc `main`) that adds URL hygiene in
// front of TanStack Start, matching the previous deployment:
//
// - Trailing slashes redirect permanently (308) to the canonical URL, for
//   pages and server routes alike.
// - Start only renders a page when the request accepts text/html or */* and
//   answers 500 otherwise. Essays negotiate markdown themselves (see the
//   essay route); every other page request is made acceptable as HTML, since
//   HTML is all those pages have. Server-function calls are left untouched.
export default {
  fetch(request: Request): Promise<Response> | Response {
    const url = new URL(request.url);

    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(TRAILING_SLASHES, "");
      return Response.redirect(url.toString(), 308);
    }

    const negotiatesMarkdown =
      ESSAY_PAGE.test(url.pathname) && prefersMarkdown(request);

    if (
      acceptsHtml(request) ||
      negotiatesMarkdown ||
      url.pathname.startsWith(SERVER_FN_BASE)
    ) {
      return handler.fetch(request);
    }

    const headers = new Headers(request.headers);
    headers.set("accept", `${headers.get("accept")}, text/html`);
    return handler.fetch(new Request(request, { headers }));
  },
};
