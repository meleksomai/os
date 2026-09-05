import type { Research } from "content-collections";

/** A paper as the papers page renders it (content-collections.ts keeps only these fields). */
export type Paper = Research["papers"][number];
