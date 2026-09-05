export const siteConfig = {
  name: "Melek Somai",
  description:
    "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.",
  twitter: "@meleksomai",
  url: "https://www.somai.me",
  locale: "en_US",
  sitemap: "https://www.somai.me/sitemap.xml",
  /** Size and format of the Open Graph images rendered by scripts/generate-og.ts. */
  ogImage: { width: 1200, height: 630, type: "image/png" },
  social: [
    {
      name: "GitHub",
      href: "https://github.com/meleksomai",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/msomai/",
    },
    {
      name: "X",
      href: "https://twitter.com/meleksomai",
    },
  ],
} as const;

/** Absolute URL for a site path; the home page is the bare origin. */
export function siteUrl(path: string): string {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}
