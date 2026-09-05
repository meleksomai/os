import { research } from "content-collections";
import type { Paper } from "./schema";

export function listPapers(): Paper[] {
  return research.papers;
}
