import type { PublicWish } from "@workspace/database";
import { db } from "@workspace/database";
import { publish } from "@workspace/ntfy";

export async function submitWish(formData: FormData): Promise<void> {
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

  const ntfyTopic = process.env.NTFY_WISHES_ID;

  if (ntfyTopic) {
    await publish({
      topic: ntfyTopic,
      title: `New wish from ${name} (${email})`,
      message,
      tags: ["baby", "heart"],
    });
  }
}

export function getPublicWishes(): Promise<PublicWish[]> {
  return db.wishes.readPublic();
}
