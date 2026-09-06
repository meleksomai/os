import { describe, expect, it } from "vitest";
import { generateSeo } from "@/lib/seo";

const DESCRIPTION = "Description";
const SITE_DESCRIPTION =
  "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.";

describe("generateSeo", () => {
  it("falls back to the site config for the root route and emits no canonical link", () => {
    expect(generateSeo()).toEqual({
      meta: [
        { title: "Melek Somai" },
        { name: "description", content: SITE_DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Melek Somai" },
        { property: "og:locale", content: "en_US" },
        { property: "og:url", content: "https://www.somai.me" },
        { property: "og:title", content: "Melek Somai" },
        { property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image", content: "https://www.somai.me/og/home.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@meleksomai" },
        { name: "twitter:creator", content: "@meleksomai" },
        { name: "twitter:title", content: "Melek Somai" },
        { name: "twitter:description", content: SITE_DESCRIPTION },
        { name: "twitter:image:type", content: "image/png" },
        { name: "twitter:image", content: "https://www.somai.me/og/home.png" },
        { name: "twitter:image:width", content: "1200" },
        { name: "twitter:image:height", content: "630" },
      ],
      links: [],
    });
  });

  it("emits the complete card for a page with the canonical link", () => {
    expect(
      generateSeo({
        title: "Essays",
        description: DESCRIPTION,
        path: "/essays",
        ogImage: "/og/essays.png",
      })
    ).toEqual({
      meta: [
        { title: "Melek Somai | Essays" },
        { name: "description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Melek Somai" },
        { property: "og:locale", content: "en_US" },
        { property: "og:url", content: "https://www.somai.me/essays" },
        { property: "og:title", content: "Melek Somai | Essays" },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image", content: "https://www.somai.me/og/essays.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@meleksomai" },
        { name: "twitter:creator", content: "@meleksomai" },
        { name: "twitter:title", content: "Melek Somai | Essays" },
        { name: "twitter:description", content: DESCRIPTION },
        { name: "twitter:image:type", content: "image/png" },
        {
          name: "twitter:image",
          content: "https://www.somai.me/og/essays.png",
        },
        { name: "twitter:image:width", content: "1200" },
        { name: "twitter:image:height", content: "630" },
      ],
      links: [{ rel: "canonical", href: "https://www.somai.me/essays" }],
    });
  });

  it("uses the site image, a custom Twitter title and the bare origin for the home page", () => {
    const head = generateSeo({
      title: "Home",
      description: DESCRIPTION,
      path: "/",
      twitterTitle: "Melek Somai",
    });

    expect(head.meta).toContainEqual({
      property: "og:image",
      content: "https://www.somai.me/og/home.png",
    });
    expect(head.meta).toContainEqual({
      name: "twitter:title",
      content: "Melek Somai",
    });
    expect(head.meta).toContainEqual({
      property: "og:url",
      content: "https://www.somai.me",
    });
    expect(head.links).toEqual([
      { rel: "canonical", href: "https://www.somai.me" },
    ]);
  });

  it("marks essays as articles with their publish date", () => {
    const head = generateSeo({
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
  });
});
