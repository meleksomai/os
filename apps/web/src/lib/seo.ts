import type { AnyRouteMatch } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export interface PageSeo {
  /** Page part of the document title; rendered as `<site name> | <title>`. */
  title: string;
  description: string;
  /** Path of the 1200×630 Open Graph image, e.g. `/og/home.png`. */
  ogImage: string;
  /** Twitter card title when it should differ from the document title. */
  twitterTitle?: string;
}

/** The `meta` entries a route's `head()` returns. */
type RouteMeta = NonNullable<AnyRouteMatch["meta"]>;

const OG_IMAGE_WIDTH = "1200";
const OG_IMAGE_HEIGHT = "630";

/**
 * Head tags for a page, in the shape TanStack Start's `head()` expects:
 * title and description with their Open Graph counterparts, the Twitter card,
 * and the image tags. Shared values (site name, Twitter handle, origin) come
 * from `siteConfig`.
 */
export function pageMeta(seo: PageSeo): RouteMeta {
  const title = `${siteConfig.name} | ${seo.title}`;
  const imageUrl = `${siteConfig.url}${seo.ogImage}`;

  return [
    { title },
    { property: "og:title", content: title },
    { name: "description", content: seo.description },
    { property: "og:description", content: seo.description },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: siteConfig.twitter },
    { name: "twitter:creator", content: siteConfig.twitter },
    { name: "twitter:title", content: seo.twitterTitle ?? title },
    { name: "twitter:description", content: seo.description },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: OG_IMAGE_WIDTH },
    { property: "og:image:height", content: OG_IMAGE_HEIGHT },
    { name: "twitter:image:type", content: "image/png" },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:width", content: OG_IMAGE_WIDTH },
    { name: "twitter:image:height", content: OG_IMAGE_HEIGHT },
  ];
}
