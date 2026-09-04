import { lazyRouteComponent } from "@tanstack/react-router";
import type { MDXContent } from "mdx/types";
import { essaySlugFromPath } from "./slug";

const essayModules = import.meta.glob<{ default: MDXContent }>(
  "../../content/*.mdx"
);

/**
 * One code-split component per essay, keyed by slug.
 *
 * The essay route awaits `.preload()` in its loader, after which the component
 * renders synchronously — inline HTML on the server and no fallback on client
 * navigations. This is the mechanism TanStack Router uses for its own lazy
 * route components.
 */
export const essayComponentBySlug = Object.fromEntries(
  Object.entries(essayModules).map(([path, load]) => [
    essaySlugFromPath(path),
    lazyRouteComponent(load),
  ])
);
