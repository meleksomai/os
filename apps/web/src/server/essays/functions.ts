import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getEssayBySlug, listEssays } from "./server";

export const fetchAllEssays = createServerFn().handler(() => listEssays());

export const fetchEssay = createServerFn()
  .validator(z.string())
  .handler(({ data: slug }) => {
    const essay = getEssayBySlug(slug);

    if (!essay) {
      throw notFound();
    }

    return essay;
  });
