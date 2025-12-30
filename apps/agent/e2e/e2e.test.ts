import {
  createExecutionContext,
  env as testEnv,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it } from "vitest";
import worker from "..";
import { createMockEmailHelper } from "./helper";

describe("Agent Worker", () => {
  const request = createMockEmailHelper();

  it("dispatches fetch event", async () => {
    const ctx = createExecutionContext();
    await worker.email(request, testEnv as any);
    await waitOnExecutionContext(ctx);
  });
});
