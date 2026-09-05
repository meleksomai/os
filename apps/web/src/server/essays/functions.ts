import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { essayCatalog, getEssayBySlug } from "@/essays/catalog.server";
import { essaySlug } from "./schema";

export const fetchEssayList = createServerFn().handler(() => essayCatalog);

export const fetchEssay = createServerFn()
  .validator(essaySlug)
  .handler(({ data: slug }) => {
    const essay = getEssayBySlug(slug);

    if (!essay) {
      throw notFound();
    }

    return essay;
  });
