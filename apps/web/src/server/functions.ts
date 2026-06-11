import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

function assertFormData(data: unknown): FormData {
  if (!(data instanceof FormData)) {
    throw new Error("Expected form data");
  }
  return data;
}

export const fetchEssayList = createServerFn().handler(async () => {
  const { essayCatalog } = await import("../blog/catalog.server");
  return essayCatalog;
});

export const fetchEssay = createServerFn()
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { getEssayBySlug } = await import("../blog/catalog.server");
    const essay = getEssayBySlug(data.slug);

    if (!essay) {
      throw notFound();
    }

    return essay;
  });

export const fetchPapers = createServerFn().handler(async () => {
  const { default: papers } = await import("../data/papers.json");

  return papers.map((paper) => ({
    _id: paper._id,
    title: paper.title,
    doi: paper.doi,
    url: paper.url,
    published: { year: paper.published.year },
    publisher: paper.publisher,
  }));
});

export const subscribeToNewsletterFn = createServerFn({ method: "POST" })
  .validator(assertFormData)
  .handler(async ({ data }) => {
    const { subscribeToNewsletter } = await import("./newsletter");
    return await subscribeToNewsletter(data);
  });

export const submitWishFn = createServerFn({ method: "POST" })
  .validator(assertFormData)
  .handler(async ({ data }) => {
    const { submitWish } = await import("./wishes");
    await submitWish(data);
  });
