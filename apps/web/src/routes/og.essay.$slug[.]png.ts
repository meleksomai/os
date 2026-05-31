// apps/web/src/routes/og.essay.$slug[.]png.ts -> /og/essay/$slug.png
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getEssayMeta } from "../lib/essays";
import { GenerateImage } from "../lib/og";

// The router parses the whole `$slug.png` segment as a single param (named
// "slug.png" with value like "agents.png"), so we derive the clean slug from
// the request pathname instead of params.slug.
const SLUG_FROM_OG_PATH = /\/og\/essay\/(.+)\.png$/;

export const Route = createFileRoute("/og/essay/$slug.png")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { pathname } = new URL(request.url);
        const slug = SLUG_FROM_OG_PATH.exec(pathname)?.[1];
        if (!slug) {
          throw notFound();
        }
        try {
          const { metadata } = await getEssayMeta(slug);
          // ImageResponse extends Response — return it directly.
          return GenerateImage({
            title: metadata.title,
            subtitle: metadata.subtitle,
          });
        } catch {
          throw notFound();
        }
      },
    },
  },
});
