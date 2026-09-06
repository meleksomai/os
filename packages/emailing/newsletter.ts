import { Resend } from "resend";

export interface SubscribeResult {
  success: boolean;
  message: string;
}

export interface SubscribeOptions {
  email: string;
  audienceId: string;
  apiKey: string;
}

const SUBSCRIBED: SubscribeResult = {
  success: true,
  message: "Thanks for subscribing!",
};

const FAILED: SubscribeResult = {
  success: false,
  message: "Something went wrong. Please try again.",
};

/**
 * Resend answers a repeated subscription with an error rather than an
 * idempotent success. The contract test verifies this assumption against
 * the real API.
 */
function isAlreadySubscribed(error: { message: string }): boolean {
  return error.message.includes("already exists");
}

export async function subscribeContact(
  options: SubscribeOptions
): Promise<SubscribeResult> {
  const { email, audienceId, apiKey } = options;

  const resend = new Resend(apiKey);

  try {
    // The SDK never throws on an API error: it resolves with `error` set.
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId,
    });

    if (error === null || isAlreadySubscribed(error)) {
      return SUBSCRIBED;
    }
    return FAILED;
  } catch {
    return FAILED;
  }
}
