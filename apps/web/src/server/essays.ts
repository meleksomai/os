import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { essayCatalog, getEssayBySlug } from "@/essays/catalog.server";

export const fetchEssayList = createServerFn().handler(() => essayCatalog);

export const fetchEssay = createServerFn()
  .validator((slug: unknown) => {
    if (typeof slug !== "string") {
      throw new Error("Expected an essay slug");
    }
    return slug;
  })
  .handler(({ data: slug }) => {
    const essay = getEssayBySlug(slug);

    if (!essay) {
      throw notFound();
    }

    return essay;
  });
