// apps/web/src/routes/og.essays[.]png.ts -> /og/essays.png
import { createFileRoute } from "@tanstack/react-router";
import { GenerateImage } from "../lib/og";

export const Route = createFileRoute("/og/essays.png")({
  server: {
    handlers: {
      // ImageResponse extends Response — return it directly.
      GET: () =>
        GenerateImage({
          title: "Essays",
          subtitle:
            "A space to share thoughts and ideas that are often reflections on my current research.",
        }),
    },
  },
});
