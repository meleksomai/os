"use server";

import { subscribeContact } from "@workspace/emailing/newsletter";

interface SubscribeState {
  success: boolean;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

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
