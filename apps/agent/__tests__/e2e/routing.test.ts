import {
  createExecutionContext,
  env,
  listDurableObjectIds,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it, vi } from "vitest";
import worker from "../../index";
import { createMockEmailHelper } from "../helper";

// Mock LLMService to avoid real AI calls in tests We are mocking the LLMService
// used in the agent Durable Object worker to avoid making real AI calls during
// tests. This tests of the routing logic does not need to depend on LLM
// functionality and the AI Gateway.
vi.mock("@/llm-service", () => {
  return {
    LLMService: vi.fn().mockImplementation(() => ({
      classifyEmail: vi.fn().mockResolvedValue({
        intents: ["test"],
        risk: "low",
        action: "ignore",
        requires_approval: false,
        comments: "Mocked for testing",
      }),
      generateReplyDraft: vi.fn().mockResolvedValue("Mocked reply content"),
    })),
  };
});

/**
 * Email Routing Bug Test
 *
 * Tests the routing logic used in apps/agent/index.ts:
 *   createCatchAllEmailResolver("HelloEmailAgent", message.from)
 *
 * CORRECT EMAIL FLOW:
 * 1. External person sends TO routing address (hello@example.com)
 * 2. Agent processes and forwards to owner
 * 3. Owner replies FROM their email TO routing address
 * 4. External person replies again TO routing address
 *
 * EXPECTED BEHAVIOR:
 * - All emails in the same conversation thread should route to the same agent instance
 * - This maintains conversation context and memory across the thread
 *
 * CURRENT BUGGY BEHAVIOR:
 * - The resolver uses message.from as agentId
 * - External email FROM friend@example.com routes to "HelloEmailAgent:friend@example.com"
 * - Owner reply FROM owner@example.com routes to "HelloEmailAgent:owner@example.com"
 * - Different agent instances = lost conversation context
 *
 * These tests FAIL, demonstrating the bug.
 */
describe("Email Routing - Thread Continuity", () => {
  const ROUTING_EMAIL = "hello@example.com";
  const OWNER_EMAIL = "owner@example.com";
  const EXTERNAL_EMAIL = "friend@example.com";
  const THREAD_ID = "<conversation-thread-123@example.com>";

  it("should route emails in same thread to same agent instance", async () => {
    const ctx = createExecutionContext();

    // Email 1: External person sends TO routing address
    const email1 = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": THREAD_ID,
        Subject: "Help with your product",
      }),
    });

    // Email 2: Owner replies in the same thread
    const email2 = createMockEmailHelper({
      from: OWNER_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": "<reply-1@example.com>",
        "In-Reply-To": THREAD_ID,
        References: THREAD_ID,
        Subject: "Re: Help with your product",
      }),
    });

    // Email 3: External person replies again
    const email3 = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": "<reply-2@example.com>",
        "In-Reply-To": "<reply-1@example.com>",
        References: `${THREAD_ID} <reply-1@example.com>`,
        Subject: "Re: Help with your product",
      }),
    });

    // Process all three emails through the worker
    await worker.email(email1, env);
    await worker.email(email2, env);
    await worker.email(email3, env);
    await waitOnExecutionContext(ctx);

    // List all HelloEmailAgent Durable Object instances created
    const agentIds = await listDurableObjectIds(env.HelloEmailAgent);

    // EXPECTED: Only ONE agent instance for the thread
    // ACTUAL: TWO instances (friend@example.com and owner@example.com)
    // This assertion FAILS, demonstrating the bug
    expect(agentIds.length).toBe(1);
  }, 15000);

  it("should maintain same agent when owner replies", async () => {
    const ctx = createExecutionContext();

    const externalEmail = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": THREAD_ID,
      }),
    });

    const ownerReply = createMockEmailHelper({
      from: OWNER_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "In-Reply-To": THREAD_ID,
        References: THREAD_ID,
      }),
    });

    await worker.email(externalEmail, env);
    await worker.email(ownerReply, env);
    await waitOnExecutionContext(ctx);

    const agentIds = await listDurableObjectIds(env.HelloEmailAgent);

    // EXPECTED: 1 agent instance
    // ACTUAL: 2 instances
    // This assertion FAILS
    expect(agentIds.length).toBe(1);
  }, 15000);

  it("documents current buggy behavior (PASSES)", async () => {
    const ctx = createExecutionContext();

    const email1 = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({ "Message-ID": THREAD_ID }),
    });

    const email2 = createMockEmailHelper({
      from: OWNER_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "In-Reply-To": THREAD_ID,
        References: THREAD_ID,
      }),
    });

    await worker.email(email1, env);
    await worker.email(email2, env);
    await waitOnExecutionContext(ctx);

    const agentIds = await listDurableObjectIds(env.HelloEmailAgent);

    // Current buggy behavior: 2 instances created
    // This test PASSES, documenting the bug
    expect(agentIds.length).toBe(2);
  }, 15000);
});
