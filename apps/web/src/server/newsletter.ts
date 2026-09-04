import { createServerFn } from "@tanstack/react-start";
import { assertFormData } from "./form-data";
import { subscribeToNewsletter } from "./newsletter.server";

export const subscribeToNewsletterFn = createServerFn({ method: "POST" })
  .validator(assertFormData)
  .handler(({ data }) => subscribeToNewsletter(data));
