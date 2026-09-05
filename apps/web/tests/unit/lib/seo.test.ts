import { describe, expect, it } from "vitest";
import { generateDefaultSeo, generateSeo } from "@/lib/seo";

const DESCRIPTION = "Description";
const SITE_DESCRIPTION =
  "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.";

describe("generateDefaultSeo", () => {
  it("emits the complete site-wide card for the root route", () => {
    expect(generateDefaultSeo()).toEqual([
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
    ]);
  });
});

describe("generateSeo", () => {
  it("emits only the per-page overrides and the canonical link", () => {
    expect(
      generateSeo({
        title: "Home",
        description: DESCRIPTION,
        path: "/",
        twitterTitle: "Melek Somai",
      })
    ).toEqual({
      meta: [
        { title: "Melek Somai | Home" },
        { name: "description", content: DESCRIPTION },
        { property: "og:url", content: "https://www.somai.me" },
        { property: "og:title", content: "Melek Somai | Home" },
        { property: "og:description", content: DESCRIPTION },
        { name: "twitter:title", content: "Melek Somai" },
        { name: "twitter:description", content: DESCRIPTION },
      ],
      links: [{ rel: "canonical", href: "https://www.somai.me" }],
    });
  });

  it("overrides the image when the page has its own", () => {
    const head = generateSeo({
      title: "Essays",
      description: DESCRIPTION,
      path: "/essays",
      ogImage: "/og/essays.png",
    });

    expect(head.meta).toContainEqual({
      name: "twitter:title",
      content: "Melek Somai | Essays",
    });
    expect(head.meta).toContainEqual({
      property: "og:image",
      content: "https://www.somai.me/og/essays.png",
    });
    expect(head.meta).toContainEqual({
      name: "twitter:image",
      content: "https://www.somai.me/og/essays.png",
    });
    expect(head.links).toEqual([
      { rel: "canonical", href: "https://www.somai.me/essays" },
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

  it("overrides every default it repeats, so the root and page tags merge by key", () => {
    const defaultKeys = new Set(
      generateDefaultSeo().map((tag) => tag?.name ?? tag?.property ?? "title")
    );
    const pageKeys = generateSeo({
      title: "Essays",
      description: DESCRIPTION,
      path: "/essays",
      ogImage: "/og/essays.png",
    }).meta.map((tag) => tag?.name ?? tag?.property ?? "title");

    for (const key of pageKeys) {
      expect(defaultKeys.has(key), `${key} has no site-wide default`).toBe(
        true
      );
    }
  });
});
