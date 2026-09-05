import { createServerFn } from "@tanstack/react-start";
import { subscribeInput } from "./schema";
import { subscribeToNewsletter } from "./server";

export const subscribeToNewsletterFn = createServerFn({ method: "POST" })
  .validator(subscribeInput)
  .handler(({ data }) => subscribeToNewsletter(data));
