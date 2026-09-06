/**
 * The real adapter and the real Resend SDK against the fake Resend, over
 * HTTP. Hermetic, runs on every pull request. This is the layer that
 * exercises the SDK's real behaviour (it resolves API errors instead of
 * throwing), which unit tests with a mocked SDK cannot.
 */
import { randomUUID } from "node:crypto";
import { describe, expect, inject, it } from "vitest";
import { subscribeContact } from "@/newsletter";
import {
  DUPLICATE_PREFIX,
  FAKE_REQUESTS_PATH,
  OUTAGE_PREFIX,
  type RecordedRequest,
} from "@/testing/fake-resend";

const apiKey = "re_integration_fake_key";
const audienceId = "aud_integration_fake";

function uniqueEmail(prefix: string): string {
  return `${prefix}${randomUUID().slice(0, 8)}@integration.example`;
}

async function received(email: string): Promise<RecordedRequest[]> {
  const url = new URL(FAKE_REQUESTS_PATH, inject("fakeResendUrl"));
  url.searchParams.set("email", email);
  const response = await fetch(url);
  return (await response.json()) as RecordedRequest[];
}

describe("subscribeContact against the fake Resend", () => {
  it("creates the contact with the configured audience and key", async () => {
    const email = uniqueEmail("subscriber-");

    const result = await subscribeContact({ email, audienceId, apiKey });

    expect(result).toEqual({
      success: true,
      message: "Thanks for subscribing!",
    });
    expect(await received(email)).toEqual([
      {
        method: "POST",
        path: `/audiences/${audienceId}/contacts`,
        authorization: `Bearer ${apiKey}`,
        body: { email, unsubscribed: false },
      },
    ]);
  });

  it("reports success when the contact already exists", async () => {
    const email = uniqueEmail(DUPLICATE_PREFIX);

    const result = await subscribeContact({ email, audienceId, apiKey });

    expect(result.success).toBe(true);
    expect(await received(email)).toHaveLength(1);
  });

  it("reports failure when Resend is down", async () => {
    const email = uniqueEmail(OUTAGE_PREFIX);

    const result = await subscribeContact({ email, audienceId, apiKey });

    expect(result).toEqual({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  });
});
