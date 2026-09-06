/**
 * Starts the fake Resend for the integration project. The Resend SDK reads
 * RESEND_BASE_URL when its module loads, so the URL is fixed in
 * vitest.config.ts (`env`) and the fake must listen there before any test
 * file is imported: a Vitest globalSetup does exactly that.
 */
import type { TestProject } from "vitest/node";
import { startFakeResend } from "../../testing/fake-resend/index.ts";

export const INTEGRATION_RESEND_URL = "http://127.0.0.1:4175";

export async function setup(
  project: TestProject
): Promise<() => Promise<void>> {
  const { port } = new URL(INTEGRATION_RESEND_URL);
  const fake = await startFakeResend({ port: Number(port) });
  project.provide("fakeResendUrl", fake.url);
  return () => fake.close();
}

declare module "vitest" {
  export interface ProvidedContext {
    fakeResendUrl: string;
  }
}
