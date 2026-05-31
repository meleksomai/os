// apps/web/src/routes/og.home[.]png.ts -> /og/home.png
import { createFileRoute } from "@tanstack/react-router";
import { GenerateImage } from "../lib/og";

export const Route = createFileRoute("/og/home.png")({
  server: {
    handlers: {
      // ImageResponse extends Response — return it directly.
      GET: () =>
        GenerateImage({
          title: "Hi, I am Melek Somai.",
          subtitle: "Physician. Scientist. Innovator.",
        }),
    },
  },
});
