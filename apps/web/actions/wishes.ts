"use server";

import type { PublicWish } from "@workspace/database";
import { db } from "@workspace/database";
import { enableShareWishes } from "@workspace/flags";

export async function submitWish(formData: FormData): Promise<void> {
  const isShareWishesEnabled = await enableShareWishes();
  if (!isShareWishesEnabled) return;

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const isPublic = formData.get("isPublic") === "on";

  if (!(name && email && message)) {
    throw new Error("Missing required fields");
  }

  await db.wishes.submit({
    name,
    email,
    message,
    isPublic,
  });
}

export async function getPublicWishes(): Promise<PublicWish[]> {
  const isShareWishesEnabled = await enableShareWishes();
  if (!isShareWishesEnabled) return [];

  return db.wishes.readPublic();
}
