import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [{ essayCatalog }, { buildSitemapEntries, sitemapXml }] =
          await Promise.all([
            import("@/blog/catalog.server"),
            import("@/lib/sitemap"),
          ]);

        const xml = sitemapXml(buildSitemapEntries(essayCatalog, new Date()));

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
          },
        });
      },
    },
  },
});
