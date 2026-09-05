import { createFileRoute } from "@tanstack/react-router";
import { EssaySection } from "@/components/home/section-essays";
import IntroSection from "@/components/home/section-intro";
import { seo } from "@/lib/seo";
import { fetchEssayList } from "@/server/essays/functions";

export const Route = createFileRoute("/_site/")({
  loader: () => fetchEssayList(),
  head: () => ({
    meta: seo({
      title: "Home",
      description:
        "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.",
      ogImage: "/og/home.png",
      twitterTitle: "Melek Somai",
    }),
  }),
  component: HomePage,
});

function HomePage() {
  const essays = Route.useLoaderData();
  const featured = essays.filter((essay) => essay.metadata.featured);

  return (
    <div className="space-y-18 py-12 md:space-y-20 lg:space-y-24">
      <IntroSection />
      <EssaySection essays={featured} />
    </div>
  );
}
