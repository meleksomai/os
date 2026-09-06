/**
 * Values shared by the fake Resend server, the Playwright helpers, and
 * playwright.config.ts. The Worker reaches the fake through RESEND_BASE_URL in
 * wrangler.jsonc (`env.e2e.vars`), which must point at the same host and port.
 */
import { readFileSync } from "node:fs";

export const FAKE_RESEND_HOST = "127.0.0.1";
export const FAKE_RESEND_PORT = Number(process.env.FAKE_RESEND_PORT ?? 4174);
export const FAKE_RESEND_URL = `http://${FAKE_RESEND_HOST}:${FAKE_RESEND_PORT}`;

/** Control endpoints, outside Resend's API surface. */
export const FAKE_HEALTH_PATH = "/__fake/health";
export const FAKE_REQUESTS_PATH = "/__fake/requests";

/**
 * Email local-part prefixes that select a scripted answer. Anything else is
 * accepted. Keeping the behaviour in the address, not in shared server state,
 * lets Playwright workers run in parallel against one fake.
 */
export const OUTAGE_PREFIX = "outage-";
export const DUPLICATE_PREFIX = "duplicate-";

export interface RecordedRequest {
  method: string;
  path: string;
  authorization: string | null;
  body: unknown;
}

/** The dummy secrets the e2e Worker runs with, read from .dev.vars.e2e. */
export function e2eDevVars(): { apiKey: string; audienceId: string } {
  const file = readFileSync(
    new URL("../../../../.dev.vars.e2e", import.meta.url),
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
