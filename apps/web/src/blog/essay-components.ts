import { type ComponentType, lazy } from "react";

const essayModules = import.meta.glob("../../content/*.mdx") as Record<
  string,
  () => Promise<{ default: ComponentType }>
>;

const mdxExtensionRegex = /\.mdx$/;

/**
 * Lazily loaded MDX components keyed by slug. Each essay stays in its own
 * chunk so visiting one essay does not download the others.
 */
export const essayComponentBySlug: Record<
  string,
  React.LazyExoticComponent<ComponentType>
> = Object.fromEntries(
  Object.entries(essayModules).map(([path, load]) => {
    const fileName = path.split("/").pop() ?? path;
    const slug = fileName.replace(mdxExtensionRegex, "");
    return [slug, lazy(load)];
  })
);
