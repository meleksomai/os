import { siteConfig } from "../config/site";

export interface PageSeo {
  title?: string;
  description?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
}

interface MetaTag {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
  charSet?: string;
}

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

/**
 * Builds the same head tags the Next.js app emitted: title/description with
 * their OG counterparts, the twitter card meta, and the og:image plus
 * twitter:image tags produced by the opengraph-image file convention.
 */
export function pageMeta(seo: PageSeo): MetaTag[] {
  const meta: MetaTag[] = [];
  const width = String(seo.ogImageWidth ?? OG_IMAGE_WIDTH);
  const height = String(seo.ogImageHeight ?? OG_IMAGE_HEIGHT);

  if (seo.title) {
    meta.push(
      { title: seo.title },
      { property: "og:title", content: seo.title }
    );
  }

  if (seo.description) {
    meta.push(
      { name: "description", content: seo.description },
      { property: "og:description", content: seo.description }
    );
  }

  if (seo.twitterTitle || seo.ogImage) {
    meta.push({ name: "twitter:card", content: "summary_large_image" });
  }

  if (seo.twitterTitle) {
    meta.push(
      { name: "twitter:site", content: "https://somai.me" },
      { name: "twitter:creator", content: "@meleksomai" },
      { name: "twitter:title", content: seo.twitterTitle },
      {
        name: "twitter:description",
        content: seo.twitterDescription ?? seo.description ?? "",
      }
    );
  }

  if (seo.ogImage) {
    const imageUrl = `${siteConfig.url}${seo.ogImage}`;

    meta.push(
      { property: "og:image:type", content: "image/png" },
      { property: "og:image", content: imageUrl },
      { property: "og:image:width", content: width },
      { property: "og:image:height", content: height },
      { name: "twitter:image:type", content: "image/png" },
      { name: "twitter:image", content: imageUrl },
      { name: "twitter:image:width", content: width },
      { name: "twitter:image:height", content: height }
    );
  }

  return meta;
}
