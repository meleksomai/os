import { createFileRoute } from "@tanstack/react-router";
import { EssaySection } from "@/components/home/section-essays";
import IntroSection from "@/components/home/section-intro";
import { siteConfig } from "@/config/site";
import { generateJsonLd, personJsonLd } from "@/lib/jsonld";
import { generateSeo } from "@/lib/seo";
import { fetchEssayList } from "@/server/essays/functions";

export const Route = createFileRoute("/_site/")({
  loader: () => fetchEssayList(),
  head: () => ({
    ...generateSeo({
      title: "Home",
      description: siteConfig.description,
      path: "/",
      twitterTitle: "Melek Somai",
    }),
    scripts: [generateJsonLd(personJsonLd)],
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
