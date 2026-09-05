import { createFileRoute } from "@tanstack/react-router";
import { HeaderSection } from "@/components/papers/section-header";
import { PapersSection } from "@/components/papers/section-papers";
import { seo } from "@/lib/seo";
import { fetchPapers } from "@/server/papers/functions";

export const Route = createFileRoute("/_site/papers")({
  loader: () => fetchPapers(),
  head: () =>
    seo({
      title: "Research Papers",
      description:
        "Research in areas ranging from Clinical Computing, Patient Remote Monitoring, Neuro-Epidemiology, to AI and Machine Learning",
      path: "/papers",
      ogImage: "/og/papers.png",
    }),
  component: PapersPage,
});

function PapersPage() {
  const papers = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-20">
      <HeaderSection />
      <PapersSection papers={papers} />
    </div>
  );
}
