import type { AnyRouteMatch } from "@tanstack/react-router";
import type { BlogPosting, Person, Thing, WithContext } from "schema-dts";
import { siteConfig, siteUrl } from "@/config/site";

/** A Schema.org object with its `@context`, typed by `schema-dts` (types only, no runtime). */
export type JsonLd = WithContext<Thing>;

type HeadScript = NonNullable<
  NonNullable<AnyRouteMatch["headScripts"]>[number]
>;

/**
 * Head script entry for a JSON-LD object, for a route's `head().scripts`.
 * JSON-LD is by definition a `<script type="application/ld+json">`; `<` is
 * escaped so a value can never close the tag.
 */
export function generateJsonLd(data: JsonLd): HeadScript {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data).replaceAll("<", "\\u003c"),
  };
}

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
  description: siteConfig.description,
  url: siteConfig.url,
  sameAs: siteConfig.social.map((link) => link.href),
} satisfies Person;

/** The home page's structured data: the site owner. */
export const personJsonLd: WithContext<Person> = {
  "@context": "https://schema.org",
  ...person,
};

export interface BlogInput {
  title: string;
  description: string;
  /** Path of the essay, e.g. `/essay/agents`. */
  path: string;
  /** Path of the Open Graph image, e.g. `/og/essay-agents.png`. */
  ogImage: string;
  /** Frontmatter date, `YYYY-MM-DD`. */
  publishedAt: string;
}

/** An essay's structured data, authored by the site owner. */
export function blogJsonLd(input: BlogInput): WithContext<BlogPosting> {
  const url = siteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image: siteUrl(input.ogImage),
    datePublished: new Date(input.publishedAt).toISOString(),
    author: person,
    url,
    mainEntityOfPage: url,
  };
}
