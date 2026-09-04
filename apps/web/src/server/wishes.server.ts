import { db } from "@workspace/database";
import { publish } from "@workspace/ntfy";
import { isValidEmail } from "./email";
import type { ActionResult } from "./types";

const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;

const MISSING_FIELDS: ActionResult = {
  success: false,
  message: "Please fill in your name, email, and message",
};

const INVALID_EMAIL: ActionResult = {
  success: false,
  message: "Please enter a valid email",
};

const TOO_LONG: ActionResult = {
  success: false,
  message: `Please keep your name under ${MAX_NAME_LENGTH} characters and your message under ${MAX_MESSAGE_LENGTH}`,
};

const FAILED: ActionResult = {
  success: false,
  message: "Something went wrong. Please try again.",
};

export const WISH_RECEIVED: ActionResult = {
  success: true,
  message: "Thank you for your wishes!",
};

function textField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitWish(formData: FormData): Promise<ActionResult> {
  const name = textField(formData, "name");
  const email = textField(formData, "email").toLowerCase();
  const message = textField(formData, "message");
  const isPublic = formData.get("isPublic") === "on";

  if (!(name && email && message)) {
    return MISSING_FIELDS;
  }
  if (!isValidEmail(email)) {
    return INVALID_EMAIL;
  }
  if (name.length > MAX_NAME_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return TOO_LONG;
  }

  try {
    await db.wishes.submit({ name, email, message, isPublic });
  } catch (error) {
    console.error("Failed to store wish", error);
    return FAILED;
  }

  // The wish is saved; a notification failure must not turn it into an error.
  const topic = process.env.NTFY_WISHES_ID;
  if (topic) {
    try {
      await publish({
        topic,
        title: `New wish from ${name} (${email})`,
        message,
        tags: ["baby", "heart"],
      });
    } catch (error) {
      console.error("Failed to notify about new wish", error);
    }
  }

  return WISH_RECEIVED;
}
