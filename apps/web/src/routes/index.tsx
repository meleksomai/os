// apps/web/src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Chrome } from "../components/chrome";
import { EssaySection } from "../components/section-home-essays";
import { IntroSection } from "../components/section-intro";
import { getFeaturedEssays } from "../lib/essays";

const DESCRIPTION =
  "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.";

export const Route = createFileRoute("/")({
  // Returns serializable featured essay metadata (NO Essay component).
  loader: () => getFeaturedEssays(),
  head: () => ({
    meta: [
      { title: "Melek Somai | Home" },
      { name: "description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Melek Somai" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:creator", content: "@meleksomai" },
      { name: "twitter:site", content: "https://somai.me" },
      // Next auto-wired og:image from the colocated opengraph-image.tsx;
      // TanStack does not, so reference the /og/home.png server route here.
      { property: "og:image", content: "/og/home.png" },
      { name: "twitter:image", content: "/og/home.png" },
    ],
  }),
  component: Home,
});

function Home() {
  const essays = Route.useLoaderData();

  return (
    <Chrome>
      <div className="space-y-18 py-12 md:space-y-20 lg:space-y-24">
        <IntroSection />
        <EssaySection essays={essays} />
      </div>
    </Chrome>
  );
}
