import type { Metadata } from "next";
import { getBlogEssays } from "@/app/(blog)/utils";
import { EssaySection } from "./_components/section-essays";
import IntroSection from "./_components/section-intro";

export const metadata: Metadata = {
  title: "Melek Somai | Home",
  description:
    "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.",
  twitter: {
    card: "summary_large_image",
    title: "Melek Somai",
    description:
      "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.",
    creator: "@meleksomai",
    site: "https://somai.me",
  },
};

export default async function Page() {
  const articles = await getBlogEssays();

  return (
    <div className="space-y-18 py-12 md:space-y-20 lg:space-y-24">
      <IntroSection />
      <EssaySection
        essays={articles
          .filter((article) => article.metadata.featured)
          .map((article) => ({ ...article, Essay: undefined }))}
      />
    </div>
  );
}
