/**
 * User agents asking for text/markdown or text/plain get an essay's markdown
 * rendition instead of the page. Shared by the Worker entry and the essay
 * route so both agree on what "prefers markdown" means.
 */
export function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/markdown") || accept.includes("text/plain");
}
