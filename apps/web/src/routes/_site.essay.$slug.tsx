import { MDXProvider } from "@mdx-js/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Heading1, Heading3 } from "@workspace/ui/blocks/headings";
import { Suspense } from "react";
import { mdxComponents } from "@/components/mdx-components";
import { essayComponentBySlug } from "@/essays/components";
import { essayMarkdownResponse } from "@/essays/markdown.server";
import { prefersMarkdown } from "@/essays/negotiation";
import { pageMeta } from "@/lib/seo";
import { fetchEssay } from "@/server/essays";

export const Route = createFileRoute("/_site/essay/$slug")({
  server: {
    handlers: {
      // Content negotiation on the canonical essay URL: agents asking for
      // text/markdown or text/plain get the markdown rendition (or its 404);
      // browsers fall through to the page.
      GET: ({ request, params, next }) => {
        if (!prefersMarkdown(request)) {
          return next();
        }

        const response = essayMarkdownResponse(params.slug);
        response.headers.set("Vary", "Accept");
        return response;
      },
    },
  },
  headers: () => ({ Vary: "Accept" }),
  loader: async ({ params }) => {
    const essay = await fetchEssay({ data: params.slug });
    const Essay = essayComponentBySlug[essay.slug];

    if (!Essay) {
      throw notFound();
    }

    // Load the essay's chunk before rendering: the server renders it inline,
    // and client navigations (or link hover, via preload "intent") never show
    // a fallback.
    await Essay.preload?.();

    return essay;
  },
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
            {/* Only the first hydration can suspend here: dehydrated matches
                skip the loader, so the chunk loads while React keeps the
                server-rendered essay in place. */}
            <Suspense fallback={null}>{Essay ? <Essay /> : null}</Suspense>
          </MDXProvider>
        </div>
      </div>
    </article>
  );
}
