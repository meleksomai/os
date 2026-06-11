import { Heading2 } from "@workspace/ui/blocks/headings";

export interface PaperListItem {
  _id: string;
  title: string;
  doi?: string;
  url?: string[];
  published: { year: string };
  publisher?: string;
}

export const PapersSection = ({ papers }: { papers: PaperListItem[] }) => (
  <div className="flex flex-col gap-4">
    {papers.map((paper) => (
      <a
        className="group flex cursor-pointer flex-col justify-between gap-2 border-foreground/10 border-b py-6 transition-all duration-700 hover:border-foreground/20 md:py-8"
        href={
          paper.url?.at(0) || paper.doi ? `https://doi.org/${paper.doi}` : "#"
        }
        key={paper._id}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Heading2 className="mr-12 mb-1 transition-transform duration-300 group-hover:translate-x-2">
          {paper.title}
        </Heading2>
        <p className="font-mono text-muted-foreground text-xs uppercase md:text-sm">
          {!!paper.doi && (
            <>
              / DOI: <span className="text-muted-foreground">{paper.doi}</span>
            </>
          )}
          / {paper.published.year} / {paper.publisher}
        </p>
      </a>
    ))}
  </div>
);
