import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { essaySlug } from "./schema";
import { getEssayBySlug, listEssays } from "./server";

export const fetchAllEssays = createServerFn().handler(() => listEssays());

export const fetchEssay = createServerFn()
  .validator(essaySlug)
  .handler(({ data: slug }) => {
    const essay = getEssayBySlug(slug);

    if (!essay) {
      throw notFound();
    }

    return essay;
  });
