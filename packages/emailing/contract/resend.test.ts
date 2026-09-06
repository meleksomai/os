/**
 * Contract test: runs the real adapter against the real Resend API.
 *
 * The unit tests and the web app's e2e suite work against doubles of Resend
 * (mocked SDK, fake HTTP server). This test is the periodic check that those
 * doubles still describe reality: it exercises the same assumptions with a
 * dedicated Resend audience and cleans up after itself. It is the `contract`
 * Vitest project (vitest.config.ts), not part of `pnpm test`; the scheduled
 * `contract` GitHub workflow runs `pnpm --filter @workspace/emailing
 * test:contract` with the secrets set.
 *
 * Required environment: RESEND_API_KEY, RESEND_CONTRACT_AUDIENCE_ID (an
 * audience used for nothing else). Account-level webhooks still fire for it.
 */
import { Resend } from "resend";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { subscribeContact } from "../newsletter";

const apiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_CONTRACT_AUDIENCE_ID;
const configured = Boolean(apiKey && audienceId);

// A unique address per run, on a domain we own, so runs never collide.
const email = `contract-${Date.now().toString(36)}@somai.me`;

describe.skipIf(!configured)("Resend contract", () => {
  const audience = audienceId ?? "";
  // Built in a hook: the describe body still runs at collection time when
  // the suite is skipped, and the SDK throws on an empty key.
  let resend: Resend;

  beforeAll(() => {
    resend = new Resend(apiKey);
  });

  afterAll(async () => {
    await resend.contacts.remove({ audienceId: audience, email });
  });

  it("creates a contact and the adapter reports success", async () => {
    const result = await subscribeContact({
      email,
      audienceId: audience,
      apiKey: apiKey ?? "",
    });
    expect(result.success).toBe(true);

    const { data, error } = await resend.contacts.get({
      audienceId: audience,
      email,
    });
    expect(error).toBeNull();
    expect(data?.email).toBe(email);
  });

  it("treats a repeated subscription as success", async () => {
    // The adapter maps Resend's "already exists" answer to success; if Resend
    // ever changes that answer, this is where it shows.
    const result = await subscribeContact({
      email,
      audienceId: audience,
      apiKey: apiKey ?? "",
    });
    expect(result.success).toBe(true);
  });
});
