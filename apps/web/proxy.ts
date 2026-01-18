import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle .md extension in URL (e.g., /essay/agents.md)
  if (pathname.endsWith(".md")) {
    const url = request.nextUrl.clone();
    const slug = pathname.replace("/essay/", "").replace(".md", "");
    url.pathname = `/essay/${slug}/md`;
    return NextResponse.rewrite(url);
  }

  // Handle Accept header for markdown
  const accept = request.headers.get("accept") ?? "";
  const prefersMarkdown =
    accept.includes("text/markdown") || accept.includes("text/plain");

  if (prefersMarkdown) {
    const url = request.nextUrl.clone();
    url.pathname = `${url.pathname}/md`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/essay/:slug", "/essay/:slug.md"],
};
