export const siteConfig = {
  name: "Melek Somai",
  twitter: "@meleksomai",
  url: "https://www.somai.me",
  locale: "en_US",
  sitemap: "https://www.somai.me/sitemap.xml",
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
