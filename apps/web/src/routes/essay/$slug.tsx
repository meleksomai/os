import { MDXProvider } from "@mdx-js/react";
import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Heading1, Heading3 } from "@workspace/ui/blocks/headings";
import type { MDXContent } from "mdx/types";
import { Suspense } from "react";
import { mdxComponents } from "@/components/common/mdx-components";
import { blogJsonLd, generateJsonLd } from "@/lib/jsonld";
import { generateSeo } from "@/lib/seo";
import { fetchEssay } from "@/server/essays/functions";

// One code-split chunk per essay, keyed by its file name (= slug). The loader
// preloads the chunk, the way TanStack Router loads its own lazy route
// components, so the server renders the body inline and client navigations
// never show a fallback.
const essayContent = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: MDXContent }>("../../../content/*.mdx")
  ).map(([path, load]) => [
    path.slice(path.lastIndexOf("/") + 1, -".mdx".length),
    lazyRouteComponent(load),
  ])
);

export const Route = createFileRoute("/essay/$slug")({
  loader: async ({ params }) => {
    const essay = await fetchEssay({ data: params.slug });
    await essayContent[essay.slug]?.preload?.();
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
  const Content = essayContent[slug];

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
          <MDXProvider components={mdxComponents}>
            {/* Only the first hydration can suspend here: dehydrated matches
                skip the loader, so the chunk loads while React keeps the
                server-rendered body in place. */}
            <Suspense fallback={null}>{Content ? <Content /> : null}</Suspense>
          </MDXProvider>
        </div>
      </div>
    </article>
  );
}
