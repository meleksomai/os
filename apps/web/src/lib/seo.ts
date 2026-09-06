import type { AnyRouteMatch } from "@tanstack/react-router";
import { siteConfig, siteUrl } from "@/config/site";

export interface PageSeo {
  /** Page part of the document title, rendered as `<site name> | <title>`; omitted, the site name alone. */
  title?: string;
  /** Defaults to the site description. */
  description?: string;
  /** Path of the page, e.g. `/essays`; becomes the canonical URL and `og:url`. Omitted (root route), `og:url` is the site URL and no canonical link is emitted. */
  path?: string;
  /** Path of the Open Graph image, e.g. `/og/essays.png`; defaults to the site image. */
  ogImage?: string;
  /** Twitter card title when it should differ from the document title. */
  twitterTitle?: string;
  /** Marks the page as an article (essay): Open Graph article tags. */
  article?: {
    /** Frontmatter date, `YYYY-MM-DD`. */
    publishedAt: string;
  };
}

/** The head tags `generateSeo()` produces; spread into a route's `head()` result. */
export interface HeadTags {
  meta: NonNullable<AnyRouteMatch["meta"]>;
  links: NonNullable<AnyRouteMatch["links"]>;
}

/**
 * The complete SEO card for a page: title and description with their Open
 * Graph and Twitter counterparts, the image, and the canonical link. Every
 * value falls back to `siteConfig`, so the root route calls `generateSeo()`
 * with no arguments and pages pass only what differs. TanStack merges `meta`
 * across matched routes by `name`/`property` with the deepest route winning
 * (and keeps the deepest `title`), so a page's tags replace the root's and
 * routes without their own `head()`, such as the 404 page, keep the root's.
 * Links are not merged that way, which is why the canonical link is emitted
 * only for pages with a `path`. Structured data is separate; see
 * `generateJsonLd()` in `@/lib/jsonld`.
 */
export function generateSeo(page: PageSeo = {}): HeadTags {
  const title = page.title
    ? `${siteConfig.name} | ${page.title}`
    : siteConfig.name;
  const description = page.description ?? siteConfig.description;
  const url = page.path ? siteUrl(page.path) : siteConfig.url;
  const imageUrl = siteUrl(page.ogImage ?? siteConfig.ogImage.default);
  const imageWidth = String(siteConfig.ogImage.width);
  const imageHeight = String(siteConfig.ogImage.height);

  const meta: HeadTags["meta"] = [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: page.article ? "article" : "website" },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:locale", content: siteConfig.locale },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image:type", content: siteConfig.ogImage.type },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: imageWidth },
    { property: "og:image:height", content: imageHeight },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: siteConfig.twitter },
    { name: "twitter:creator", content: siteConfig.twitter },
    { name: "twitter:title", content: page.twitterTitle ?? title },
    { name: "twitter:description", content: description },
    { name: "twitter:image:type", content: siteConfig.ogImage.type },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:width", content: imageWidth },
    { name: "twitter:image:height", content: imageHeight },
  ];

  if (page.article) {
    meta.push(
      {
        property: "article:published_time",
        content: new Date(page.article.publishedAt).toISOString(),
      },
      { property: "article:author", content: siteConfig.url }
    );
  }

  return {
    meta,
    links: page.path ? [{ rel: "canonical", href: url }] : [],
  };
}
