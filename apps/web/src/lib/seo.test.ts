import { describe, expect, it } from "vitest";
import { pageMeta } from "./seo";

const DESCRIPTION = "Description";

describe("pageMeta", () => {
  it("emits exactly the tag set Next.js produced for a full page", () => {
    const meta = pageMeta({
      title: "Melek Somai | Home",
      description: DESCRIPTION,
      twitterTitle: "Melek Somai",
      ogImage: "/og/home.png",
    });

    expect(meta).toEqual([
      { title: "Melek Somai | Home" },
      { property: "og:title", content: "Melek Somai | Home" },
      { name: "description", content: DESCRIPTION },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "https://somai.me" },
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

  it("uses a dedicated twitter description when given", () => {
    const meta = pageMeta({
      description: DESCRIPTION,
      twitterTitle: "Title",
      twitterDescription: "Twitter description",
    });

    expect(meta).toContainEqual({
      name: "twitter:description",
      content: "Twitter description",
    });
  });

  it("emits only the card and image tags for image-only pages like /baby", () => {
    const meta = pageMeta({ ogImage: "/og/baby.png" });

    expect(meta).toEqual([
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image", content: "https://www.somai.me/og/baby.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image:type", content: "image/png" },
      { name: "twitter:image", content: "https://www.somai.me/og/baby.png" },
      { name: "twitter:image:width", content: "1200" },
      { name: "twitter:image:height", content: "630" },
    ]);
  });
});
