import { createServerFn } from "@tanstack/react-start";
import { assertFormData } from "./form-data";
import { submitWish } from "./wishes.server";

export const submitWishFn = createServerFn({ method: "POST" })
  .validator(assertFormData)
  .handler(({ data }) => submitWish(data));
