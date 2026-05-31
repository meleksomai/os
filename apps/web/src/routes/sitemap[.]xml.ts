// apps/web/src/routes/sitemap[.]xml.ts
import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "../config/site";
import { parsePublishedAt } from "../lib/date";
import { getBlogEssays } from "../lib/essays";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // fs read happens inside the handler (NOT a module top-level await).
        const essays = await getBlogEssays();
        const urls = [
          { loc: siteConfig.url, changefreq: "yearly", priority: 1 },
          {
            loc: `${siteConfig.url}/essays`,
            changefreq: "weekly",
            priority: 0.5,
          },
          // NOTE: preserving the existing /research entry though the real route
          // is /papers (pre-existing quirk carried over verbatim from the Next
          // sitemap; do NOT silently rename to /papers).
          {
            loc: `${siteConfig.url}/research`,
            changefreq: "monthly",
            priority: 0.5,
          },
          ...essays.map((essay) => ({
            loc: `${siteConfig.url}/essay/${essay.slug}`,
            lastmod: parsePublishedAt(essay.metadata.publishedAt).toISOString(),
            changefreq: "monthly",
            priority: 0.4,
          })),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map(
            (url) =>
              `  <url><loc>${url.loc}</loc>${"lastmod" in url ? `<lastmod>${url.lastmod}</lastmod>` : ""}<changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`
          )
          .join("\n")}\n</urlset>`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml" },
        });
      },
    },
  },
});
