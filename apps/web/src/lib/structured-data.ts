import type { BlogPosting, Person, Thing, WithContext } from "schema-dts";
import { siteConfig } from "@/config/site";

/** A Schema.org object with its `@context`, typed by `schema-dts` (types only, no runtime). */
export type JsonLd = WithContext<Thing>;

/**
 * Stable identifier for the site owner. Every page that mentions the person
 * (as the subject of the home page, as the author of an essay) points at this
 * same node, which lets search engines merge them into one entity.
 */
export const PERSON_ID = `${siteConfig.url}/#person`;

/** The site owner as a Schema.org Person. */
export const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: siteConfig.name,
  url: siteConfig.url,
  sameAs: siteConfig.social.map((link) => link.href),
} satisfies Person;

/** The home page's structured data: the person, with the page description as bio. */
export function personJsonLd(description: string): WithContext<Person> {
  return { "@context": "https://schema.org", ...person, description };
}

export interface BlogPostingInput {
  title: string;
  description: string;
  /** Absolute URL of the essay. */
  url: string;
  /** Absolute URL of the 1200×630 Open Graph image. */
  imageUrl: string;
  /** ISO 8601 publication date. */
  publishedAt: string;
}

/** An essay's structured data, authored by the site owner. */
export function blogPostingJsonLd(
  input: BlogPostingInput
): WithContext<BlogPosting> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image: input.imageUrl,
    datePublished: input.publishedAt,
    author: person,
    url: input.url,
    mainEntityOfPage: input.url,
  };
}
