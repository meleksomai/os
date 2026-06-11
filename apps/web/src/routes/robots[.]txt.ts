import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

const robotsTxt = `User-Agent: *
Allow: /

Sitemap: ${siteConfig.sitemap}
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(robotsTxt, {
          headers: {
            "Content-Type": "text/plain",
          },
        }),
    },
  },
});
