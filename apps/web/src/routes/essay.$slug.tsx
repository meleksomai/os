import { createFileRoute, notFound } from "@tanstack/react-router";
import { Heading1, Heading3 } from "@workspace/ui/blocks/headings";
import { Chrome } from "../components/chrome";
import { getEssayMeta, getEssayModule } from "../lib/essays";

export const Route = createFileRoute("/essay/$slug")({
  // Loader returns ONLY serializable metadata (no React component). Unknown
  // slugs throw notFound() (replaces Next dynamicParams=false 404 behavior).
  loader: async ({ params }) => {
    try {
      return await getEssayMeta(params.slug);
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Melek Somai | ${loaderData.metadata.title}` },
          { name: "description", content: loaderData.metadata.subtitle },
          { name: "twitter:card", content: "summary_large_image" },
          {
            name: "twitter:title",
            content: `Melek Somai | ${loaderData.metadata.title}`,
          },
          {
            name: "twitter:description",
            content: loaderData.metadata.subtitle,
          },
          { name: "twitter:creator", content: "@meleksomai" },
          { name: "twitter:site", content: "https://somai.me" },
          { property: "og:image", content: `/og/essay/${loaderData.slug}.png` },
          {
            name: "twitter:image",
            content: `/og/essay/${loaderData.slug}.png`,
          },
        ]
      : [],
  }),
  // The `.md` URL and Accept: text/markdown|text/plain content negotiation
  // (replacing proxy.ts) is handled globally in src/start.ts request
  // middleware, since server-route handlers in @tanstack/react-start do not
  // receive a next() to fall through to HTML SSR.
  component: EssayPage,
});

function EssayPage() {
  const { slug, metadata, readingTime } = Route.useLoaderData();
  // Re-resolve the compiled MDX component in the component tree (NOT via the
  // loader JSON, since React components are not serializable).
  const Essay = getEssayModule(slug);
  return (
    <Chrome>
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
          {/* MDXProvider is wired globally in __root.tsx — <Essay/> picks up
              the component mappings via context. */}
          <div className="animation-delay-450 prose animate-fade-slide-up">
            <Essay />
          </div>
        </div>
      </article>
    </Chrome>
  );
}
