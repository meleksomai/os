// apps/web/src/routes/og.papers[.]png.ts -> /og/papers.png
import { createFileRoute } from "@tanstack/react-router";
import { GenerateImage } from "../lib/og";

export const Route = createFileRoute("/og/papers.png")({
  server: {
    handlers: {
      // ImageResponse extends Response — return it directly.
      GET: () =>
        GenerateImage({
          title: "Research Papers",
          subtitle:
            "Research in areas ranging from Clinical Computing, Patient Remote Monitoring, Neuro-Epidemiology, to AI and Machine Learning",
        }),
    },
  },
});
