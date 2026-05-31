// apps/web/src/lib/wishes.ts
// Baby-wishes submission/read. Core logic is kept as plain async functions so
// they stay unit-testable with the original submitWish(formData) /
// getPublicWishes() call shapes; the createServerFn wrappers adapt them to the
// ({ data }) RPC boundary. Not named *.server.ts so the createServerFn RPC
// client stub (submitWishFn) can be imported by the client signbook — the
// handler body and its server-only deps (db/ntfy/flags) are stripped from the
// client bundle by the TanStack Start build transform.
import { createServerFn } from "@tanstack/react-start";
import { db, type PublicWish } from "@workspace/database";
import { enableShareWishes } from "@workspace/flags";
import { publish } from "@workspace/ntfy";

export async function submitWish(formData: FormData): Promise<void> {
  const isShareWishesEnabled = await enableShareWishes();
  if (!isShareWishesEnabled) {
    return;
  }

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

  const topic = process.env.NTFY_WISHES_ID;
  if (topic) {
    await publish({
      topic,
      title: `New wish from ${name} (${email})`,
      message,
      tags: ["baby", "heart"],
    });
  }
}

export async function getPublicWishes(): Promise<PublicWish[]> {
  const isShareWishesEnabled = await enableShareWishes();
  if (!isShareWishesEnabled) {
    return [];
  }

  return db.wishes.readPublic();
}

export const submitWishFn = createServerFn({ method: "POST" })
  // Pass FormData straight through; the handler runs the core logic server-side.
  .inputValidator((data: FormData) => data)
  .handler(({ data }) => submitWish(data));

export const getPublicWishesFn = createServerFn({ method: "GET" }).handler(() =>
  getPublicWishes()
);
