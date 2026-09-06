// The client-safe re-export of the collection's type: components import it
// from here because a Biome rule keeps "content-collections" itself out of
// client code (the rule cannot tell type-only imports apart).
export type { Essay } from "content-collections";
