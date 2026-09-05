import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { subscribeToNewsletter } from "./server";

export const subscribeToNewsletterFn = createServerFn({ method: "POST" })
  .validator(z.instanceof(FormData))
  .handler(({ data }) => subscribeToNewsletter(data));
