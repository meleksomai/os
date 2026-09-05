import { createFileRoute } from "@tanstack/react-router";
import { EssaysSection } from "@/components/essays/section-essays";
import { HeaderSection } from "@/components/essays/section-header";
import { generateSeo } from "@/lib/seo";
import { fetchAllEssays } from "@/server/essays/functions";

export const Route = createFileRoute("/essays")({
  loader: () => fetchAllEssays(),
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
  const posts = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-20">
      <HeaderSection />
      <EssaysSection posts={posts} />
    </div>
  );
}
