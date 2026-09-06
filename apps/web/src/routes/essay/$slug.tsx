import { MDXProvider } from "@mdx-js/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Heading1, Heading3 } from "@workspace/ui/blocks/headings";
import { allEssays } from "content-collections";
import { mdxComponents } from "@/components/common/mdx-components";
import { blogJsonLd, generateJsonLd } from "@/lib/jsonld";
import { generateSeo } from "@/lib/seo";

function findEssay(slug: string) {
  return allEssays.find((essay) => essay.slug === slug);
}

export const Route = createFileRoute("/essay/$slug")({
  loader: ({ params }) => {
    if (!findEssay(params.slug)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const essay = findEssay(params.slug);
    if (!essay) {
      return {};
    }
    const page = {
      title: essay.title,
      description: essay.subtitle,
      path: `/essay/${essay.slug}`,
      ogImage: `/og/essay-${essay.slug}.png`,
      publishedAt: essay.publishedAt,
    };
    return {
      ...generateSeo({ ...page, article: { publishedAt: page.publishedAt } }),
      scripts: [generateJsonLd(blogJsonLd(page))],
    };
  },
  component: EssayPage,
});

function EssayPage() {
  const { slug } = Route.useParams();
  const essay = findEssay(slug);
  if (!essay) {
    throw notFound();
  }
  const Content = essay.mdx;

  return (
    <article>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="animate-fade-slide-up">
            <Heading1>{essay.title}</Heading1>
          </div>
          <div className="animation-delay-150 animate-fade-slide-up">
            <Heading3 className="font-mono text-muted-foreground uppercase">
              {essay.subtitle}
            </Heading3>
          </div>
          <div className="animation-delay-300 animate-fade-slide-up py-8 font-mono text-muted-foreground text-xs uppercase md:text-sm">
            / {essay.publishedAtFormatted} / {essay.readingTime.text} /{" "}
            {essay.readingTime.words} words
          </div>
        </div>
        <div className="animation-delay-450 prose animate-fade-slide-up">
          <MDXProvider components={mdxComponents}>
            <Content />
          </MDXProvider>
        </div>
      </div>
    </article>
  );
}
