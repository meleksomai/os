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

export async function subscribeContact(
  options: SubscribeOptions
): Promise<SubscribeResult> {
  const { email, audienceId, apiKey } = options;

  const resend = new Resend(apiKey);

  try {
    await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId,
    });

    return { success: true, message: "Thanks for subscribing!" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return { success: true, message: "Thanks for subscribing!" };
    }

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
