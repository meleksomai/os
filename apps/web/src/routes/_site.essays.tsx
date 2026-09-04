import { createFileRoute } from "@tanstack/react-router";
import { EssaysSection } from "@/components/essays/section-essays";
import { HeaderSection } from "@/components/essays/section-header";
import { pageMeta } from "@/lib/seo";
import { fetchEssayList } from "@/server/essays";

export const Route = createFileRoute("/_site/essays")({
  loader: () => fetchEssayList(),
  head: () => ({
    meta: pageMeta({
      title: "Melek Somai | Essays",
      description:
        "A space to share thoughts and ideas that are often reflections on my current research.",
      twitterTitle: "Melek Somai | Essays",
      ogImage: "/og/essays.png",
    }),
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
