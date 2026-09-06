/**
 * Starts the fake Resend for the integration project, at the RESEND_BASE_URL
 * the project sets in vitest.config.ts. The Resend SDK reads that variable
 * when its module loads, so the fake must listen there before any test file
 * is imported: a Vitest globalSetup does exactly that.
 */
import type { TestProject } from "vitest/node";
import { startFakeResend } from "@/testing/fake-resend";

export async function setup(
  project: TestProject
): Promise<() => Promise<void>> {
  const baseUrl = project.config.env.RESEND_BASE_URL;
  if (!baseUrl) {
    throw new Error("the integration project must set env.RESEND_BASE_URL");
  }
  const { hostname, port } = new URL(baseUrl);
  const fake = await startFakeResend({ host: hostname, port: Number(port) });
  project.provide("fakeResendUrl", fake.url);
  return () => fake.close();
}

declare module "vitest" {
  export interface ProvidedContext {
    fakeResendUrl: string;
  }
}
