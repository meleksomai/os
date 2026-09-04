import { createServerFn } from "@tanstack/react-start";
import papers from "../../content/papers.json";

export interface PaperListItem {
  _id: string;
  title: string;
  doi?: string;
  url?: string[];
  published: { year: string };
  publisher?: string;
}

/** The fields the papers page renders; the rest of the record stays on the server. */
export const fetchPapers = createServerFn().handler((): PaperListItem[] =>
  papers.map((paper) => ({
    _id: paper._id,
    title: paper.title,
    doi: paper.doi,
    url: paper.url,
    published: { year: paper.published.year },
    publisher: paper.publisher,
  }))
);
