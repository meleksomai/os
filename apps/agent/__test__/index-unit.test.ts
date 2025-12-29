import {
  createExecutionContext,
  env as testEnv,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "../index";
import { createMockEmailHelper } from "./helper";

describe("Agent Worker", () => {
  const request = createMockEmailHelper();

  it("dispatches fetch event", async () => {
    const ctx = createExecutionContext();
    await worker.email(request, testEnv);
    await waitOnExecutionContext(ctx);
  });
});
