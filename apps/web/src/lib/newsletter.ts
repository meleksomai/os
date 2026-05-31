// apps/web/src/lib/newsletter.ts
// Newsletter subscription. The core logic is a plain async function (kept
// unit-testable with the original (prevState, formData) shape) and the
// createServerFn wrapper adapts it to the ({ data }) RPC boundary. This module
// is intentionally NOT named *.server.ts so the createServerFn RPC client stub
// can be imported by the client contact-form; the handler body is stripped from
// the client bundle by the TanStack Start build transform.
import { createServerFn } from "@tanstack/react-start";
import { subscribeContact } from "@workspace/emailing/newsletter";

export interface SubscribeState {
  success: boolean;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

// biome-ignore lint/suspicious/useAwait: async signature is the public contract (matches the useActionState adapter + unit tests); the success path returns subscribeContact's promise.
export async function subscribeToNewsletter(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return { success: false, message: "Please enter a valid email" };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedEmail.length === 0) {
    return { success: false, message: "Please enter a valid email" };
  }

  if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
    return { success: false, message: "Please enter a valid email" };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { success: false, message: "Please enter a valid email" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_SEGMENT_GENERAL;

  if (!apiKey) {
    return { success: false, message: "Subscription temporarily unavailable" };
  }

  if (!audienceId) {
    return { success: false, message: "Subscription temporarily unavailable" };
  }

  return subscribeContact({
    email: trimmedEmail,
    audienceId,
    apiKey,
  });
}

const initialState: SubscribeState = { success: false, message: "" };

export const subscribeToNewsletterFn = createServerFn({ method: "POST" })
  // Pass FormData straight through; the handler runs the core logic server-side.
  .inputValidator((data: FormData) => data)
  .handler(({ data }) => subscribeToNewsletter(initialState, data));
