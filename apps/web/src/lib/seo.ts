import type { AnyRouteMatch } from "@tanstack/react-router";
import { siteConfig, siteUrl } from "@/config/site";
import { parsePublishedAt } from "@/lib/date";

export interface PageSeo {
  /** Page part of the document title; rendered as `<site name> | <title>`. */
  title: string;
  description: string;
  /** Path of the page, e.g. `/essays`; becomes the canonical URL and `og:url`. */
  path: string;
  /** Path of the 1200×630 Open Graph image, e.g. `/og/home.png`. */
  ogImage: string;
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

const OG_IMAGE_WIDTH = "1200";
const OG_IMAGE_HEIGHT = "630";

/**
 * Head tags for a page, in the shape TanStack Start's `head()` expects: title
 * and description with their Open Graph and Twitter counterparts, and the
 * canonical URL. Shared values (site name, Twitter handle, origin, locale)
 * come from `siteConfig`, so routes only pass what varies per page.
 * Structured data is separate; see `generateJsonLd()` in `@/lib/jsonld`.
 */
export function generateSeo(page: PageSeo): HeadTags {
  const title = `${siteConfig.name} | ${page.title}`;
  const url = siteUrl(page.path);
  const imageUrl = siteUrl(page.ogImage);

  const meta: HeadTags["meta"] = [
    { title },
    { name: "description", content: page.description },
    { property: "og:type", content: page.article ? "article" : "website" },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:locale", content: siteConfig.locale },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: page.description },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: OG_IMAGE_WIDTH },
    { property: "og:image:height", content: OG_IMAGE_HEIGHT },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: siteConfig.twitter },
    { name: "twitter:creator", content: siteConfig.twitter },
    { name: "twitter:title", content: page.twitterTitle ?? title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image:type", content: "image/png" },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:width", content: OG_IMAGE_WIDTH },
    { name: "twitter:image:height", content: OG_IMAGE_HEIGHT },
  ];

  if (page.article) {
    meta.push(
      {
        property: "article:published_time",
        content: parsePublishedAt(page.article.publishedAt).toISOString(),
      },
      { property: "article:author", content: siteConfig.url }
    );
  }

  return { meta, links: [{ rel: "canonical", href: url }] };
}
