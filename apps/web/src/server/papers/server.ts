import papers from "../../../content/papers.json";
import type { PaperListItem } from "./schema";

export function listPapers(): PaperListItem[] {
  return papers.map((paper) => ({
    _id: paper._id,
    title: paper.title,
    doi: paper.doi,
    url: paper.url,
    published: { year: paper.published.year },
    publisher: paper.publisher,
  }));
}
