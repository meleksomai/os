import { MDXProvider } from "@mdx-js/react";
import { lazyRouteComponent } from "@tanstack/react-router";
import type { MDXContent } from "mdx/types";
import { Suspense } from "react";
import { mdxComponents } from "@/components/common/mdx-components";
import { essaySlugFromPath } from "@/server/essays/schema";

// One code-split chunk per essay, keyed by slug, loaded with the mechanism
// TanStack Router uses for its own lazy route components.
const contentBySlug = new Map(
  Object.entries(
    import.meta.glob<{ default: MDXContent }>("../../../content/*.mdx")
  ).map(([path, load]) => [essaySlugFromPath(path), lazyRouteComponent(load)])
);

function contentFor(slug: string) {
  const Content = contentBySlug.get(slug);
  if (!Content) {
    // The catalog and this map come from the same files, so this is a build bug.
    throw new Error(`No MDX content for essay "${slug}"`);
  }
  return Content;
}

/**
 * Loads an essay's chunk before it renders, so the server renders the body
 * inline and client navigations never show a fallback. The essay route awaits
 * it in its loader.
 */
export function preloadEssayContent(slug: string): Promise<void> {
  return contentFor(slug).preload?.() ?? Promise.resolve();
}

/** The body of an essay, compiled from `content/<slug>.mdx`. */
export function EssayContent({ slug }: { slug: string }) {
  const Content = contentFor(slug);

  return (
    <MDXProvider components={mdxComponents}>
      {/* Only the first hydration can suspend here: dehydrated matches skip
          the loader, so the chunk loads while React keeps the server-rendered
          body in place. */}
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </MDXProvider>
  );
}
