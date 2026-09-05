/** The fields the papers page renders; the rest of the record stays on the server. */
export interface PaperListItem {
  _id: string;
  title: string;
  doi?: string;
  url?: string[];
  published: { year: string };
  publisher?: string;
}
