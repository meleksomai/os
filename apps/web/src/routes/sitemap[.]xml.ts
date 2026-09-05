import { createFileRoute } from "@tanstack/react-router";
import { buildSitemapEntries, sitemapXml } from "@/lib/sitemap";
import { listEssays } from "@/server/essays/server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(sitemapXml(buildSitemapEntries(listEssays())), {
          headers: { "Content-Type": "application/xml" },
        }),
    },
  },
});
