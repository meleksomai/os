import { MDXProvider } from "@mdx-js/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Heading1, Heading3 } from "@workspace/ui/blocks/headings";
import { Suspense } from "react";
import { essayComponentBySlug } from "@/blog/essay-components";
import { mdxComponents } from "@/components/mdx-components";
import { pageMeta } from "@/lib/seo";
import { fetchEssay } from "@/server/functions";

function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/markdown") || accept.includes("text/plain");
}

export const Route = createFileRoute("/_site/essay/$slug")({
  server: {
    handlers: {
      // Content negotiation previously handled by proxy.ts: agents asking
      // for text/markdown or text/plain get the raw essay markdown at the
      // canonical essay URL; browsers fall through to SSR.
      GET: async ({ request, params, next }) => {
        if (prefersMarkdown(request)) {
          const { essayMarkdownResponse } = await import("@/blog/raw.server");
          return essayMarkdownResponse(params.slug);
        }
        return await next();
      },
    },
  },
  loader: ({ params }) => fetchEssay({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? pageMeta({
          title: `Melek Somai | ${loaderData.metadata.title}`,
          description: loaderData.metadata.subtitle,
          twitterTitle: `Melek Somai | ${loaderData.metadata.title}`,
          ogImage: `/og/essay-${loaderData.slug}.png`,
        })
      : [],
  }),
  component: EssayPage,
});

function EssayPage() {
  const { slug, metadata, readingTime } = Route.useLoaderData();
  const Essay = essayComponentBySlug[slug];

  if (!Essay) {
    throw notFound();
  }

  return (
    <article>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="animate-fade-slide-up">
            <Heading1>{metadata.title}</Heading1>
          </div>
          <div className="animation-delay-150 animate-fade-slide-up">
            <Heading3 className="font-mono text-muted-foreground uppercase">
              {metadata.subtitle}
            </Heading3>
          </div>
          <div className="animation-delay-300 animate-fade-slide-up py-8 font-mono text-muted-foreground text-xs uppercase md:text-sm">
            / {metadata.publishedAtFormatted} / {readingTime.text} /{" "}
            {readingTime.words} words
          </div>
        </div>
        <div className="animation-delay-450 prose animate-fade-slide-up">
          <MDXProvider components={mdxComponents}>
            <Suspense fallback={null}>
              <Essay />
            </Suspense>
          </MDXProvider>
        </div>
      </div>
    </article>
  );
}
