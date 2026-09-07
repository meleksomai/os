/**
 * Contract test: runs the real adapter against the real Resend API.
 *
 * The unit tests and the web app's e2e suite work against doubles of Resend
 * (mocked SDK, fake HTTP server). This test is the periodic check that those
 * doubles still describe reality: it exercises the same assumptions with a
 * dedicated Resend segment and cleans up after itself. It is the `contract`
 * Vitest project (vitest.config.ts), not part of `pnpm test`; the scheduled
 * `contract` GitHub workflow runs `pnpm --filter @workspace/emailing
 * test:contract` with the secrets set.
 *
 * Required environment: RESEND_API_KEY, RESEND_CONTRACT_SEGMENT_ID (a segment
 * used for nothing else). Account-level webhooks still fire for it.
 *
 * What it pins down, and what broke before it existed: Resend replaced
 * Audiences with Segments. The adapter used to create contacts through the
 * deprecated `POST /audiences/{id}/contacts` with the segment id from
 * RESEND_SEGMENT_GENERAL; the mocks and the fake accepted that happily, and
 * only the real API can say whether a contact actually lands in the segment.
 */
import { Resend } from "resend";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { subscribeContact } from "@/newsletter";

const apiKey = process.env.RESEND_API_KEY;
const segmentId = process.env.RESEND_CONTRACT_SEGMENT_ID;
const configured = Boolean(apiKey && segmentId);

// A unique address per run, on a domain we own, so runs never collide.
const email = `contract-${Date.now().toString(36)}@somai.me`;

describe.skipIf(!configured)("Resend contract", () => {
  const segment = segmentId ?? "";
  // Built in a hook: the describe body still runs at collection time when
  // the suite is skipped, and the SDK throws on an empty key.
  let resend: Resend;

  const segmentsOfContact = async (): Promise<string[]> => {
    const { data, error } = await resend.contacts.segments.list({ email });
    if (error) {
      throw new Error(
        `listing the contact's segments failed: ${error.message}`
      );
    }
    return (data?.data ?? []).map((item) => item.id);
  };

  const subscribe = () =>
    subscribeContact({ email, segmentId: segment, apiKey: apiKey ?? "" });

  beforeAll(() => {
    resend = new Resend(apiKey);
  });

  afterAll(async () => {
    await resend.contacts.remove({ email });
  });

  it("creates the contact in the segment and reports success", async () => {
    const result = await subscribe();
    expect(result.success).toBe(true);

    const { data, error } = await resend.contacts.get({ email });
    expect(error).toBeNull();
    expect(data?.email).toBe(email);
    expect(data?.unsubscribed).toBe(false);
    expect(await segmentsOfContact()).toContain(segment);
  });

  it("treats a repeated subscription as success", async () => {
    // The adapter maps Resend's "already exists" answer to success; if Resend
    // ever changes that answer, this is where it shows.
    const result = await subscribe();
    expect(result.success).toBe(true);
    expect(await segmentsOfContact()).toContain(segment);
  });

  it("adds an existing contact that left the segment back to it", async () => {
    // Contacts are global in Resend: creating one that exists fails, so the
    // adapter falls back to adding the contact to the segment.
    const removed = await resend.contacts.segments.remove({
      email,
      segmentId: segment,
    });
    expect(removed.error).toBeNull();
    expect(await segmentsOfContact()).not.toContain(segment);

    const result = await subscribe();
    expect(result.success).toBe(true);
    expect(await segmentsOfContact()).toContain(segment);
  });
});
