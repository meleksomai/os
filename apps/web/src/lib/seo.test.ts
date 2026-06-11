import { describe, expect, it } from "vitest";
import { pageMeta } from "./seo";

describe("pageMeta", () => {
  it("emits the same tag set Next.js produced for a full page", () => {
    const meta = pageMeta({
      title: "Melek Somai | Home",
      description: "Description",
      twitterTitle: "Melek Somai",
      ogImage: "/og/home.png",
    });

    expect(meta).toContainEqual({ title: "Melek Somai | Home" });
    expect(meta).toContainEqual({
      property: "og:title",
      content: "Melek Somai | Home",
    });
    expect(meta).toContainEqual({
      name: "description",
      content: "Description",
    });
    expect(meta).toContainEqual({
      property: "og:description",
      content: "Description",
    });
    expect(meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    });
    expect(meta).toContainEqual({
      name: "twitter:creator",
      content: "@meleksomai",
    });
    expect(meta).toContainEqual({
      name: "twitter:site",
      content: "https://somai.me",
    });
    expect(meta).toContainEqual({
      property: "og:image",
      content: "https://www.somai.me/og/home.png",
    });
    expect(meta).toContainEqual({
      name: "twitter:image",
      content: "https://www.somai.me/og/home.png",
    });
    expect(meta).toContainEqual({
      property: "og:image:width",
      content: "1200",
    });
    expect(meta).toContainEqual({
      property: "og:image:height",
      content: "630",
    });
  });

  it("falls back to description for twitter:description", () => {
    const meta = pageMeta({
      description: "Shared description",
      twitterTitle: "Title",
    });

    expect(meta).toContainEqual({
      name: "twitter:description",
      content: "Shared description",
    });
  });

  it("emits twitter:card with image-only pages like /baby", () => {
    const meta = pageMeta({ ogImage: "/og/baby.png" });

    expect(meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    });
    expect(meta.some((tag) => tag.title)).toBe(false);
    expect(meta.some((tag) => tag.name === "twitter:title")).toBe(false);
  });
});
