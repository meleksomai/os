import { createFileRoute } from "@tanstack/react-router";
import { allEssays } from "content-collections";
import { EssaysSection } from "@/components/essays/section-essays";
import { HeaderSection } from "@/components/essays/section-header";
import { generateSeo } from "@/lib/seo";

export const Route = createFileRoute("/essays")({
  head: () =>
    generateSeo({
      title: "Essays",
      description:
        "A space to share thoughts and ideas that are often reflections on my current research.",
      path: "/essays",
      ogImage: "/og/essays.png",
    }),
  component: EssaysPage,
});

function EssaysPage() {
  const posts = [...allEssays].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  return (
    <div className="flex flex-col gap-20">
      <HeaderSection />
      <EssaysSection posts={posts} />
    </div>
  );
}
