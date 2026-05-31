import { createFileRoute } from "@tanstack/react-router";
import { Chrome } from "../components/chrome";
import { EssaysSection } from "../components/section-essays";
import { HeaderSection } from "../components/section-header";
import { getBlogEssays } from "../lib/essays";

const DESCRIPTION =
  "A space to share thoughts and ideas that are often reflections on my current research.";

export const Route = createFileRoute("/essays")({
  // Loader returns serializable metadata (no Essay component).
  loader: () => getBlogEssays(),
  head: () => ({
    meta: [
      { title: "Melek Somai | Essays" },
      { name: "description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Melek Somai | Essays" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:creator", content: "@meleksomai" },
      { name: "twitter:site", content: "https://somai.me" },
      { property: "og:image", content: "/og/essays.png" },
      { name: "twitter:image", content: "/og/essays.png" },
    ],
  }),
  component: EssaysPage,
});

function EssaysPage() {
  const posts = Route.useLoaderData();
  return (
    <Chrome>
      <div className="flex flex-col gap-20">
        <HeaderSection />
        <EssaysSection posts={posts} />
      </div>
    </Chrome>
  );
}
