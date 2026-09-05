import { createServerFn } from "@tanstack/react-start";
import { listPapers } from "./server";

export const fetchPapers = createServerFn().handler(() => listPapers());
