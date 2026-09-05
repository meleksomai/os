import { createFileRoute } from "@tanstack/react-router";
import { Heading1, Heading3 } from "@workspace/ui/blocks/headings";
import { EssayContent, preloadEssayContent } from "@/components/essays/content";
import { blogJsonLd, generateJsonLd } from "@/lib/jsonld";
import { generateSeo } from "@/lib/seo";
import { fetchEssay } from "@/server/essays/functions";
import { essayMarkdownResponse } from "@/server/essays/server";

function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/markdown") || accept.includes("text/plain");
}

export const Route = createFileRoute("/essay/$slug")({
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
    await preloadEssayContent(essay.slug);
    return essay;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const page = {
      title: loaderData.title,
      description: loaderData.subtitle,
      path: `/essay/${loaderData.slug}`,
      ogImage: `/og/essay-${loaderData.slug}.png`,
      publishedAt: loaderData.publishedAt,
    };
    return {
      ...generateSeo({ ...page, article: { publishedAt: page.publishedAt } }),
      scripts: [generateJsonLd(blogJsonLd(page))],
    };
  },
  component: EssayPage,
});

function EssayPage() {
  const { slug, title, subtitle, publishedAtFormatted, readingTime } =
    Route.useLoaderData();

  return (
    <article>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="animate-fade-slide-up">
            <Heading1>{title}</Heading1>
          </div>
          <div className="animation-delay-150 animate-fade-slide-up">
            <Heading3 className="font-mono text-muted-foreground uppercase">
              {subtitle}
            </Heading3>
          </div>
          <div className="animation-delay-300 animate-fade-slide-up py-8 font-mono text-muted-foreground text-xs uppercase md:text-sm">
            / {publishedAtFormatted} / {readingTime.text} / {readingTime.words}{" "}
            words
          </div>
        </div>
        <div className="animation-delay-450 prose animate-fade-slide-up">
          <EssayContent slug={slug} />
        </div>
      </div>
    </article>
  );
}
