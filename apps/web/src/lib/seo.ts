import type { AnyRouteMatch } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
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
  /** Marks the page as an article (essay): Open Graph article tags + BlogPosting data. */
  article?: {
    /** Frontmatter date, `YYYY-MM-DD`. */
    publishedAt: string;
  };
  /** Extra JSON-LD object for the page, e.g. `personJsonLd()` on the home page. */
  structuredData?: JsonLd;
}

export type JsonLd = Record<string, unknown>;

/** What a route's `head()` returns. */
export interface HeadTags {
  meta: NonNullable<AnyRouteMatch["meta"]>;
  links: NonNullable<AnyRouteMatch["links"]>;
  scripts: NonNullable<AnyRouteMatch["headScripts"]>;
}

const OG_IMAGE_WIDTH = "1200";
const OG_IMAGE_HEIGHT = "630";

/**
 * Head tags for a page, in the shape TanStack Start's `head()` expects:
 * title and description with their Open Graph and Twitter counterparts, the
 * canonical URL, and JSON-LD structured data. Shared values (site name, Twitter
 * handle, origin, locale) come from `siteConfig`, so routes only pass what
 * varies per page.
 */
export function seo(page: PageSeo): HeadTags {
  const title = `${siteConfig.name} | ${page.title}`;
  const url = `${siteConfig.url}${page.path === "/" ? "" : page.path}`;
  const imageUrl = `${siteConfig.url}${page.ogImage}`;
  const publishedAt = page.article
    ? parsePublishedAt(page.article.publishedAt).toISOString()
    : undefined;

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

  if (publishedAt) {
    meta.push(
      { property: "article:published_time", content: publishedAt },
      { property: "article:author", content: siteConfig.url }
    );
  }

  const structuredData: JsonLd[] = [];
  if (publishedAt) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: page.title,
      description: page.description,
      image: imageUrl,
      datePublished: publishedAt,
      author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
      url,
      mainEntityOfPage: url,
    });
  }
  if (page.structuredData) {
    structuredData.push(page.structuredData);
  }

  return {
    meta,
    links: [{ rel: "canonical", href: url }],
    scripts: structuredData.map((data) => ({
      type: "application/ld+json",
      children: jsonLdText(data),
    })),
  };
}

/** JSON-LD describing the site owner, for the home page. */
export function personJsonLd(description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    description,
    url: siteConfig.url,
    sameAs: siteConfig.social.map((link) => link.href),
  };
}

// `<` is escaped so a value can never close the <script> tag.
function jsonLdText(data: JsonLd): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
