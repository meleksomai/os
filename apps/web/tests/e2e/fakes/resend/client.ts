/** Playwright-side helpers for the fake Resend server (see server.ts). */
import { randomUUID } from "node:crypto";
import type { APIRequestContext } from "@playwright/test";
import {
  FAKE_REQUESTS_PATH,
  FAKE_RESEND_URL,
  type RecordedRequest,
} from "./shared.ts";

const EMAIL_DOMAIN = "e2e.example";

/**
 * A unique address per test so parallel workers can tell their requests
 * apart. The prefix selects the fake's scripted behaviour.
 */
export function uniqueEmail(prefix: string): string {
  return `${prefix}${randomUUID().slice(0, 8)}@${EMAIL_DOMAIN}`;
}

/** Every request the fake received whose body carries this email. */
export async function recordedRequestsFor(
  request: APIRequestContext,
  email: string
): Promise<RecordedRequest[]> {
  const url = new URL(FAKE_REQUESTS_PATH, FAKE_RESEND_URL);
  url.searchParams.set("email", email);
  const response = await request.get(url.toString());
  return (await response.json()) as RecordedRequest[];
}
