import { describe, expect, it } from "vitest";
import { blogJsonLd, generateJsonLd, personJsonLd } from "@/lib/jsonld";

const PERSON = {
  "@type": "Person",
  "@id": "https://www.somai.me/#person",
  name: "Melek Somai",
  description:
    "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.",
  url: "https://www.somai.me",
  sameAs: [
    "https://github.com/meleksomai",
    "https://www.linkedin.com/in/msomai/",
    "https://twitter.com/meleksomai",
  ],
};

describe("generateJsonLd", () => {
  it("produces a JSON-LD head script with < escaped", () => {
    const script = generateJsonLd({
      "@context": "https://schema.org",
      "@type": "Thing",
      name: "<b>name</b>",
    });

    expect(script.type).toBe("application/ld+json");
    expect(String(script.children)).not.toContain("<");
    expect(JSON.parse(String(script.children))).toEqual({
      "@context": "https://schema.org",
      "@type": "Thing",
      name: "<b>name</b>",
    });
  });
});

describe("personJsonLd", () => {
  it("describes the site owner with a stable @id and social profiles", () => {
    expect(personJsonLd).toEqual({
      "@context": "https://schema.org",
      ...PERSON,
    });
  });
});

describe("blogJsonLd", () => {
  it("describes an essay authored by the site owner", () => {
    expect(
      blogJsonLd({
        title: "Agent-First Systems",
        description: "Description",
        path: "/essay/agents",
        ogImage: "/og/essay-agents.png",
        publishedAt: "2026-01-02",
      })
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Agent-First Systems",
      description: "Description",
      image: "https://www.somai.me/og/essay-agents.png",
      datePublished: "2026-01-02T00:00:00.000Z",
      author: PERSON,
      url: "https://www.somai.me/essay/agents",
      mainEntityOfPage: "https://www.somai.me/essay/agents",
    });
  });
});
