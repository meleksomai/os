import { Heading1, Heading3 } from "@workspace/ui/blocks/headings";
import { getBlogEssay, getBlogEssays } from "../../utils";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { Essay, metadata, readingTime } = await getBlogEssay(slug);

  return (
    <article>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="animate-fade-slide-up">
            <Heading1>{metadata.title}</Heading1>
          </div>
          <div className="animation-delay-150 animate-fade-slide-up">
            <Heading3 className="font-mono text-muted-foreground uppercase">
              {metadata.subtitle}
            </Heading3>
          </div>
          <div className="animation-delay-300 animate-fade-slide-up py-8 font-mono text-muted-foreground text-xs uppercase md:text-sm">
            / {metadata.publishedAtFormatted} / {readingTime.text} /{" "}
            {readingTime.words} words
          </div>
        </div>
        <div className="animation-delay-450 prose animate-fade-slide-up">
          <Essay />
        </div>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const essays = await getBlogEssays();

  return essays.map((essay) => ({ slug: essay.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { metadata } = await getBlogEssay(slug);

  return {
    title: `Melek Somai | ${metadata.title}`,
    description: metadata.subtitle,
    twitter: {
      card: "summary_large_image",
      title: `Melek Somai | ${metadata.title}`,
      description: metadata.subtitle,
      creator: "@meleksomai",
      site: "https://somai.me",
    },
  };
}
