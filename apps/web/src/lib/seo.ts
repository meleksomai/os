import type { AnyRouteMatch } from "@tanstack/react-router";
import { siteConfig, siteUrl } from "@/config/site";
import { parsePublishedAt } from "@/lib/date";

export interface PageSeo {
  /** Page part of the document title; rendered as `<site name> | <title>`. */
  title: string;
  description: string;
  /** Path of the page, e.g. `/essays`; becomes the canonical URL and `og:url`. */
  path: string;
  /** Path of the page's Open Graph image, e.g. `/og/essays.png`; defaults to the site image. */
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
 * Site-wide head tags for the root route. TanStack merges `meta` across the
 * matched routes by `name`/`property` (and picks the deepest `title`), so every
 * page starts from this complete card and `generateSeo()` only overrides what
 * differs. Pages without their own `head()`, such as the 404 page, get it whole.
 */
export function generateDefaultSeo(): HeadTags["meta"] {
  const imageUrl = siteUrl(siteConfig.ogImage.default);
  const imageWidth = String(siteConfig.ogImage.width);
  const imageHeight = String(siteConfig.ogImage.height);

  return [
    { title: siteConfig.name },
    { name: "description", content: siteConfig.description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:locale", content: siteConfig.locale },
    { property: "og:url", content: siteConfig.url },
    { property: "og:title", content: siteConfig.name },
    { property: "og:description", content: siteConfig.description },
    { property: "og:image:type", content: siteConfig.ogImage.type },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: imageWidth },
    { property: "og:image:height", content: imageHeight },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: siteConfig.twitter },
    { name: "twitter:creator", content: siteConfig.twitter },
    { name: "twitter:title", content: siteConfig.name },
    { name: "twitter:description", content: siteConfig.description },
    { name: "twitter:image:type", content: siteConfig.ogImage.type },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:width", content: imageWidth },
    { name: "twitter:image:height", content: imageHeight },
  ];
}

/**
 * Per-page head tags, overriding the root defaults by key: title and
 * description with their Open Graph and Twitter counterparts, the page image
 * when it has one, article tags for essays, and the canonical link. Links are
 * not merged by key, so the canonical link only ever lives here.
 * Structured data is separate; see `generateJsonLd()` in `@/lib/jsonld`.
 */
export function generateSeo(page: PageSeo): HeadTags {
  const title = `${siteConfig.name} | ${page.title}`;
  const url = siteUrl(page.path);

  const meta: HeadTags["meta"] = [
    { title },
    { name: "description", content: page.description },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: page.description },
    { name: "twitter:title", content: page.twitterTitle ?? title },
    { name: "twitter:description", content: page.description },
  ];

  if (page.ogImage) {
    const imageUrl = siteUrl(page.ogImage);
    meta.push(
      { property: "og:image", content: imageUrl },
      { name: "twitter:image", content: imageUrl }
    );
  }

  if (page.article) {
    meta.push(
      { property: "og:type", content: "article" },
      {
        property: "article:published_time",
        content: parsePublishedAt(page.article.publishedAt).toISOString(),
      },
      { property: "article:author", content: siteConfig.url }
    );
  }

  return { meta, links: [{ rel: "canonical", href: url }] };
}
