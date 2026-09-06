/**
 * Playwright-side helpers for the fake Resend the e2e Worker talks to. The
 * fake itself lives with the package that wraps Resend
 * (`@workspace/emailing/testing/fake-resend`).
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import type { APIRequestContext } from "@playwright/test";
import {
  FAKE_REQUESTS_PATH,
  FAKE_RESEND_HOST,
  FAKE_RESEND_PORT,
  type RecordedRequest,
} from "@workspace/emailing/testing/fake-resend";

const FAKE_RESEND_URL = `http://${FAKE_RESEND_HOST}:${FAKE_RESEND_PORT}`;
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

/** The dummy secrets the e2e Worker runs with, read from .dev.vars.e2e. */
export function e2eDevVars(): { apiKey: string; audienceId: string } {
  const file = readFileSync(
    new URL("../../../.dev.vars.e2e", import.meta.url),
    "utf8"
  );
  const vars = new Map<string, string>();
  for (const line of file.split("\n")) {
    const separator = line.indexOf("=");
    if (line.startsWith("#") || separator === -1) {
      continue;
    }
    vars.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  const apiKey = vars.get("RESEND_API_KEY");
  const audienceId = vars.get("RESEND_SEGMENT_GENERAL");
  if (!(apiKey && audienceId)) {
    throw new Error(
      ".dev.vars.e2e must define RESEND_API_KEY and RESEND_SEGMENT_GENERAL"
    );
  }
  return { apiKey, audienceId };
}
