import type { Essay as EssayDocument } from "content-collections";

/** An essay as the pages see it: everything the collection holds except the markdown rendition. */
export type Essay = Omit<EssayDocument, "markdown">;
