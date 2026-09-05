import { describe, expect, it } from "vitest";
import { seo } from "@/lib/seo";
import { personJsonLd } from "@/lib/structured-data";

const DESCRIPTION = "Description";

function jsonLd(scripts: ReturnType<typeof seo>["scripts"]) {
  return scripts.map((script) => JSON.parse(String(script?.children)));
}

describe("seo", () => {
  it("emits the full tag set for a page", () => {
    const head = seo({
      title: "Home",
      description: DESCRIPTION,
      path: "/",
      ogImage: "/og/home.png",
      twitterTitle: "Melek Somai",
    });

    expect(head.meta).toEqual([
      { title: "Melek Somai | Home" },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Melek Somai" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: "https://www.somai.me" },
      { property: "og:title", content: "Melek Somai | Home" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image", content: "https://www.somai.me/og/home.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@meleksomai" },
      { name: "twitter:creator", content: "@meleksomai" },
      { name: "twitter:title", content: "Melek Somai" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image:type", content: "image/png" },
      { name: "twitter:image", content: "https://www.somai.me/og/home.png" },
      { name: "twitter:image:width", content: "1200" },
      { name: "twitter:image:height", content: "630" },
    ]);
    expect(head.links).toEqual([
      { rel: "canonical", href: "https://www.somai.me" },
    ]);
    expect(head.scripts).toEqual([]);
  });

  it("defaults the Twitter title to the document title and builds the canonical URL from the path", () => {
    const head = seo({
      title: "Essays",
      description: DESCRIPTION,
      path: "/essays",
      ogImage: "/og/essays.png",
    });

    expect(head.meta).toContainEqual({ title: "Melek Somai | Essays" });
    expect(head.meta).toContainEqual({
      name: "twitter:title",
      content: "Melek Somai | Essays",
    });
    expect(head.meta).toContainEqual({
      property: "og:url",
      content: "https://www.somai.me/essays",
    });
    expect(head.links).toEqual([
      { rel: "canonical", href: "https://www.somai.me/essays" },
    ]);
  });

  it("marks essays as articles with their publish date and BlogPosting data", () => {
    const head = seo({
      title: "Agent-First Systems",
      description: DESCRIPTION,
      path: "/essay/agents",
      ogImage: "/og/essay-agents.png",
      article: { publishedAt: "2026-01-02" },
    });

    expect(head.meta).toContainEqual({
      property: "og:type",
      content: "article",
    });
    expect(head.meta).toContainEqual({
      property: "article:published_time",
      content: "2026-01-02T00:00:00.000Z",
    });
    expect(head.meta).toContainEqual({
      property: "article:author",
      content: "https://www.somai.me",
    });
    expect(jsonLd(head.scripts)).toEqual([
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "Agent-First Systems",
        description: DESCRIPTION,
        image: "https://www.somai.me/og/essay-agents.png",
        datePublished: "2026-01-02T00:00:00.000Z",
        author: {
          "@type": "Person",
          "@id": "https://www.somai.me/#person",
          name: "Melek Somai",
          url: "https://www.somai.me",
          sameAs: [
            "https://github.com/meleksomai",
            "https://www.linkedin.com/in/msomai/",
            "https://twitter.com/meleksomai",
          ],
        },
        url: "https://www.somai.me/essay/agents",
        mainEntityOfPage: "https://www.somai.me/essay/agents",
      },
    ]);
  });

  it("includes extra structured data and escapes it for a script tag", () => {
    const head = seo({
      title: "Home",
      description: DESCRIPTION,
      path: "/",
      ogImage: "/og/home.png",
      structuredData: personJsonLd("<b>bio</b>"),
    });

    const [script] = head.scripts;
    expect(script?.type).toBe("application/ld+json");
    expect(String(script?.children)).not.toContain("<");
    expect(jsonLd(head.scripts)).toEqual([
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://www.somai.me/#person",
        name: "Melek Somai",
        description: "<b>bio</b>",
        url: "https://www.somai.me",
        sameAs: [
          "https://github.com/meleksomai",
          "https://www.linkedin.com/in/msomai/",
          "https://twitter.com/meleksomai",
        ],
      },
    ]);
  });
});
