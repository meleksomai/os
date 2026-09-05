/** Validator for the essay server function: a slug from the URL. */
export function essaySlug(slug: unknown): string {
  if (typeof slug !== "string") {
    throw new Error("Expected an essay slug");
  }
  return slug;
}
