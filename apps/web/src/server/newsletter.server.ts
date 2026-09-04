import { subscribeContact } from "@workspace/emailing/newsletter";
import { isValidEmail } from "./email";
import type { ActionResult } from "./types";

const INVALID_EMAIL: ActionResult = {
  success: false,
  message: "Please enter a valid email",
};

const UNAVAILABLE: ActionResult = {
  success: false,
  message: "Subscription temporarily unavailable",
};

export async function subscribeToNewsletter(
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email");

  if (typeof email !== "string") {
    return INVALID_EMAIL;
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!isValidEmail(trimmedEmail)) {
    return INVALID_EMAIL;
  }

  // Read per request: on Workers, secrets are populated into process.env for
  // each invocation and must not be cached at module scope.
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_SEGMENT_GENERAL;

  if (!(apiKey && audienceId)) {
    return UNAVAILABLE;
  }

  return await subscribeContact({ email: trimmedEmail, audienceId, apiKey });
}
