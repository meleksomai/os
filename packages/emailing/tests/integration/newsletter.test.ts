/**
 * The real adapter and the real Resend SDK against the fake Resend, over
 * HTTP. Hermetic, runs on every pull request. This is the layer that
 * exercises the SDK's real behaviour (it resolves API errors instead of
 * throwing, and it decides which endpoint an option maps to), which unit
 * tests with a mocked SDK cannot.
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
const segmentId = "seg_integration_fake";

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
  it("creates the contact in the configured segment with the key", async () => {
    const email = uniqueEmail("subscriber-");

    const result = await subscribeContact({ email, segmentId, apiKey });

    expect(result).toEqual({
      success: true,
      message: "Thanks for subscribing!",
    });
    expect(await received(email)).toEqual([
      {
        method: "POST",
        path: "/contacts",
        authorization: `Bearer ${apiKey}`,
        body: { email, unsubscribed: false, segments: [{ id: segmentId }] },
      },
    ]);
  });

  it("adds an existing contact to the segment and reports success", async () => {
    const email = uniqueEmail(DUPLICATE_PREFIX);

    const result = await subscribeContact({ email, segmentId, apiKey });

    expect(result.success).toBe(true);
    expect(await received(email)).toMatchObject([
      { method: "POST", path: "/contacts" },
      {
        method: "POST",
        path: `/contacts/${email}/segments/${segmentId}`,
        authorization: `Bearer ${apiKey}`,
      },
    ]);
  });

  it("reports failure when Resend is down", async () => {
    const email = uniqueEmail(OUTAGE_PREFIX);

    const result = await subscribeContact({ email, segmentId, apiKey });

    expect(result).toEqual({
      success: false,
      message: "Something went wrong. Please try again.",
    });
    expect(await received(email)).toHaveLength(1);
  });
});
