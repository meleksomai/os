import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it, vi } from "vitest";
import worker from "../../index";
import { createMockEmailHelper } from "../helper";

// Mock LLMService to control classification results
vi.mock("@/llm-service", () => {
  return {
    LLMService: vi.fn().mockImplementation(() => ({
      classifyEmail: vi.fn(),
      generateReplyDraft: vi.fn().mockResolvedValue("Mocked reply content"),
    })),
  };
});

/**
 * Email Operation Limits Tests
 *
 * Cloudflare imposes limits on email operations:
 * - Maximum 2 operations (reply/forward) per email object
 * - Exceeding this throws: "original email is not repliable or exceeds reply limit"
 *
 * These tests ensure the agent respects these limits.
 */
describe("Email Operation Limits", () => {
  const ROUTING_EMAIL = "hello@example.com";
  const OWNER_EMAIL = "owner@example.com";
  const EXTERNAL_EMAIL = "friend@example.com";

  it("should NOT exceed limits when action is 'reply'", async () => {
    const ctx = createExecutionContext();

    // Import the mocked LLMService to control classification
    const { LLMService } = await import("@/llm-service");
    const mockClassifyEmail = vi.fn().mockResolvedValue({
      intents: ["question"],
      risk: "low",
      action: "reply", // This will trigger email.reply()
      requires_approval: false,
      comments: "Responding to user question",
    });

    vi.mocked(LLMService).mockImplementation(
      () =>
        ({
          classifyEmail: mockClassifyEmail,
          generateReplyDraft: vi.fn().mockResolvedValue("Test reply"),
        }) as any
    );

    // Create email with operation limits enforced
    const email = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": "<test@example.com>",
      }),
      enforceOperationLimits: true, // Enable Cloudflare-like limits
    });

    // This should NOT throw an error
    await expect(worker.email(email, env)).resolves.not.toThrow();
    await waitOnExecutionContext(ctx);

    // When action is "reply", the agent should:
    // 1. Call email.reply() - 1 operation
    // 2. NOT call email.forward() (to avoid exceeding limit)
    // Total: 1 operation (within limit of 2)
  }, 15000);

  it("should NOT exceed limits when action is 'ignore'", async () => {
    const ctx = createExecutionContext();

    const { LLMService } = await import("@/llm-service");
    const mockClassifyEmail = vi.fn().mockResolvedValue({
      intents: ["spam"],
      risk: "low",
      action: "ignore", // This will NOT trigger reply
      requires_approval: false,
      comments: "Ignoring spam",
    });

    vi.mocked(LLMService).mockImplementation(
      () =>
        ({
          classifyEmail: mockClassifyEmail,
          generateReplyDraft: vi.fn().mockResolvedValue("Test reply"),
        }) as any
    );

    const email = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": "<test@example.com>",
      }),
      enforceOperationLimits: true,
    });

    // This should NOT throw an error
    await expect(worker.email(email, env)).resolves.not.toThrow();
    await waitOnExecutionContext(ctx);

    // When action is "ignore", the agent should:
    // 1. NOT call email.reply()
    // 2. Call email.forward() - 1 operation
    // Total: 1 operation (within limit of 2)
  }, 15000);

  it("WOULD exceed limits if both reply AND forward were called (demonstrating the bug)", async () => {
    const ctx = createExecutionContext();

    const { LLMService } = await import("@/llm-service");
    const mockClassifyEmail = vi.fn().mockResolvedValue({
      intents: ["question"],
      risk: "low",
      action: "reply",
      requires_approval: false,
      comments: "Test",
    });

    vi.mocked(LLMService).mockImplementation(
      () =>
        ({
          classifyEmail: mockClassifyEmail,
          generateReplyDraft: vi.fn().mockResolvedValue("Test reply"),
        }) as any
    );

    // Create a mock that would fail if both operations are called
    let operationCount = 0;
    const email = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": "<test@example.com>",
      }),
      reply: async () => {
        operationCount++;
      },
      forward: async () => {
        operationCount++;
        // If both reply AND forward are called, we exceed the limit
        if (operationCount > 1) {
          throw new Error(
            "original email is not repliable or exceeds reply limit"
          );
        }
      },
    });

    // With the fix, this should NOT throw because forward is not called when action is "reply"
    await expect(worker.email(email, env)).resolves.not.toThrow();
    await waitOnExecutionContext(ctx);

    // Verify only 1 operation was called (reply, not forward)
    expect(operationCount).toBe(1);
  }, 15000);

  it("should use SEB for replies and email.forward() for forwarding", async () => {
    const ctx = createExecutionContext();

    const { LLMService } = await import("@/llm-service");
    const mockClassifyEmail = vi.fn().mockResolvedValue({
      intents: ["question"],
      risk: "low",
      action: "reply",
      requires_approval: false,
      comments: "Test",
    });

    vi.mocked(LLMService).mockImplementation(
      () =>
        ({
          classifyEmail: mockClassifyEmail,
          generateReplyDraft: vi.fn().mockResolvedValue("Test reply"),
        }) as any
    );

    let replyCount = 0;
    let forwardCount = 0;

    const email = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": "<test@example.com>",
      }),
      reply: async () => {
        replyCount++;
      },
      forward: async () => {
        forwardCount++;
      },
    });

    await worker.email(email, env);
    await waitOnExecutionContext(ctx);

    // Agent uses SEB.send() for replies (avoids reply limits)
    // but uses email.forward() for forwarding (simple and reliable)
    expect(replyCount).toBe(0);
    expect(forwardCount).toBe(1);
  }, 15000);

  it("should always forward regardless of action", async () => {
    const ctx = createExecutionContext();

    const { LLMService } = await import("@/llm-service");
    const mockClassifyEmail = vi.fn().mockResolvedValue({
      intents: ["info"],
      risk: "low",
      action: "ignore",
      requires_approval: false,
      comments: "Test",
    });

    vi.mocked(LLMService).mockImplementation(
      () =>
        ({
          classifyEmail: mockClassifyEmail,
          generateReplyDraft: vi.fn().mockResolvedValue("Test reply"),
        }) as any
    );

    let replyCount = 0;
    let forwardCount = 0;

    const email = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": "<test@example.com>",
      }),
      reply: async () => {
        replyCount++;
      },
      forward: async () => {
        forwardCount++;
      },
    });

    await worker.email(email, env);
    await waitOnExecutionContext(ctx);

    // Always forward for record-keeping, never use email.reply()
    expect(replyCount).toBe(0);
    expect(forwardCount).toBe(1);
  }, 15000);
});
