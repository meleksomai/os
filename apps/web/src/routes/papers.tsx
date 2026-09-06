import { createFileRoute } from "@tanstack/react-router";
import { research } from "content-collections";
import { HeaderSection } from "@/components/papers/section-header";
import { PapersSection } from "@/components/papers/section-papers";
import { generateSeo } from "@/lib/seo";

export const Route = createFileRoute("/papers")({
  head: () =>
    generateSeo({
      title: "Research Papers",
      description:
        "Research in areas ranging from Clinical Computing, Patient Remote Monitoring, Neuro-Epidemiology, to AI and Machine Learning",
      path: "/papers",
      ogImage: "/og/papers.png",
    }),
  component: PapersPage,
});

function PapersPage() {
  const papers = research.papers;

  return (
    <div className="flex flex-col gap-20">
      <HeaderSection />
      <PapersSection papers={papers} />
    </div>
  );
}
