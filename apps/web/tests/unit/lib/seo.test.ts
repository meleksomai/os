import { describe, expect, it } from "vitest";
import { seo } from "@/lib/seo";

const DESCRIPTION = "Description";

describe("seo", () => {
  it("emits the full tag set with the site name, handle, and origin applied", () => {
    expect(
      seo({
        title: "Home",
        description: DESCRIPTION,
        ogImage: "/og/home.png",
        twitterTitle: "Melek Somai",
      })
    ).toEqual([
      { title: "Melek Somai | Home" },
      { property: "og:title", content: "Melek Somai | Home" },
      { name: "description", content: DESCRIPTION },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@meleksomai" },
      { name: "twitter:creator", content: "@meleksomai" },
      { name: "twitter:title", content: "Melek Somai" },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image", content: "https://www.somai.me/og/home.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image:type", content: "image/png" },
      { name: "twitter:image", content: "https://www.somai.me/og/home.png" },
      { name: "twitter:image:width", content: "1200" },
      { name: "twitter:image:height", content: "630" },
    ]);
  });

  it("defaults the Twitter title to the document title", () => {
    const meta = seo({
      title: "Essays",
      description: DESCRIPTION,
      ogImage: "/og/essays.png",
    });

    expect(meta).toContainEqual({ title: "Melek Somai | Essays" });
    expect(meta).toContainEqual({
      name: "twitter:title",
      content: "Melek Somai | Essays",
    });
  });
});
