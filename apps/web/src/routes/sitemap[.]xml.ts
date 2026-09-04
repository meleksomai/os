import { createFileRoute } from "@tanstack/react-router";
import { essayCatalog } from "@/essays/catalog.server";
import { buildSitemapEntries, sitemapXml } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(sitemapXml(buildSitemapEntries(essayCatalog)), {
          headers: { "Content-Type": "application/xml" },
        }),
    },
  },
});
