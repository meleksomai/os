// apps/web/src/routes/robots[.]txt.ts
import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "../config/site";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      // Allow all (matches the original Next robots: userAgent "*", allow "/")
      // and point at the configured sitemap URL.
      GET: () =>
        new Response(
          `User-agent: *\nAllow: /\nSitemap: ${siteConfig.sitemap}\n`,
          {
            headers: { "Content-Type": "text/plain" },
          }
        ),
    },
  },
});
