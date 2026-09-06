import { createFileRoute } from "@tanstack/react-router";
import { allEssays } from "content-collections";
import { EssaySection } from "@/components/home/section-essays";
import IntroSection from "@/components/home/section-intro";
import { siteConfig } from "@/config/site";
import { generateJsonLd, personJsonLd } from "@/lib/jsonld";
import { generateSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({
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
  const featured = allEssays
    .filter((essay) => essay.featured)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="space-y-18 py-12 md:space-y-20 lg:space-y-24">
      <IntroSection />
      <EssaySection essays={featured} />
    </div>
  );
}
