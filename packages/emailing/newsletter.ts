import { Resend } from "resend";

export interface SubscribeResult {
  success: boolean;
  message: string;
}

export interface SubscribeOptions {
  email: string;
  /**
   * The Resend Segment to add the contact to. Resend replaced Audiences with
   * Segments: contacts are global, keyed by email, and belong to segments.
   * The audience endpoints are deprecated, and the SDK refuses `audienceId`
   * together with `segments`.
   */
  segmentId: string;
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
 * Resend answers a repeated creation, or a repeated segment membership, with
 * an error rather than an idempotent success. The contract test verifies
 * this assumption against the real API.
 */
function isAlreadyThere(error: { message: string }): boolean {
  return error.message.toLowerCase().includes("already");
}

/**
 * Subscribes `email` to the segment: creates the contact in it, or, when the
 * contact already exists (it may have joined through another form, or left
 * the segment), adds the existing contact to the segment. Both paths report
 * the same success to the visitor.
 */
export async function subscribeContact(
  options: SubscribeOptions
): Promise<SubscribeResult> {
  const { email, segmentId, apiKey } = options;

  const resend = new Resend(apiKey);

  try {
    // The SDK never throws on an API error: it resolves with `error` set.
    const created = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    });

    if (created.error === null) {
      return SUBSCRIBED;
    }
    if (!isAlreadyThere(created.error)) {
      return FAILED;
    }

    const added = await resend.contacts.segments.add({ email, segmentId });

    if (added.error === null || isAlreadyThere(added.error)) {
      return SUBSCRIBED;
    }
    return FAILED;
  } catch {
    return FAILED;
  }
}
