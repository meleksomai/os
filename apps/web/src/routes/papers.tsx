import { createFileRoute } from "@tanstack/react-router";
import { Chrome } from "../components/chrome";
import { PapersSection } from "../components/section-papers";
import { HeaderSection } from "../components/section-papers-header";

const TITLE = "Melek Somai | Research Papers";
const DESCRIPTION =
  "Research in areas ranging from Clinical Computing, Patient Remote Monitoring, Neuro-Epidemiology, to AI and Machine Learning";

export const Route = createFileRoute("/papers")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      // TanStack does not auto-wire colocated opengraph-image like Next did,
      // so the OG image is referenced explicitly (served by /og/papers.png).
      { property: "og:image", content: "/og/papers.png" },
      { name: "twitter:image", content: "/og/papers.png" },
    ],
  }),
  component: PapersPage,
});

function PapersPage() {
  return (
    <Chrome>
      <div className="flex flex-col gap-20">
        <HeaderSection />
        <PapersSection />
      </div>
    </Chrome>
  );
}
