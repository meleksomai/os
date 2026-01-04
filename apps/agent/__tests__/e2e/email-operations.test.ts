import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it, vi } from "vitest";
import worker from "../../index";
import { createMockEmailHelper } from "../helper";

// Mock LLMService to control classification results
vi.mock("@/services/llm", () => {
  return {
    LLMService: vi.fn().mockImplementation(() => ({
      classifyEmail: vi.fn(),
      generateReplyDraft: vi.fn().mockResolvedValue("Mocked reply content"),
    })),
  };
});

// Mock ResendService to avoid hitting rate limits
vi.mock("@/services/resend", () => {
  return {
    ResendService: vi.fn().mockImplementation(() => ({
      sendReply: vi
        .fn()
        .mockResolvedValue({ id: "mock-resend-id", error: null }),
      sendEmail: vi
        .fn()
        .mockResolvedValue({ id: "mock-resend-id", error: null }),
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
    const { LLMService } = await import("@/services/llm");
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

    const { LLMService } = await import("@/services/llm");
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

  it("should stay within Cloudflare's 2-operation limit when replying", async () => {
    const ctx = createExecutionContext();

    const { LLMService } = await import("@/services/llm");
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

    // Track operations to ensure we don't exceed the limit
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
        // Cloudflare allows up to 2 operations
        if (operationCount > 2) {
          throw new Error(
            "original email is not repliable or exceeds reply limit"
          );
        }
      },
    });

    // Should not throw - we use Resend for replies (0 operations) + forward (1 operation)
    await expect(worker.email(email, env)).resolves.not.toThrow();
    await waitOnExecutionContext(ctx);

    // Verify we used only 1 operation (forward) - Resend doesn't count
    expect(operationCount).toBe(1);
  }, 15000);

  it("should use Resend API for replies and email.forward() for forwarding", async () => {
    const ctx = createExecutionContext();

    const { LLMService } = await import("@/services/llm");
    const { ResendService } = await import("@/services/resend");

    const mockClassifyEmail = vi.fn().mockResolvedValue({
      intents: ["question"],
      risk: "low",
      action: "reply",
      requires_approval: false,
      comments: "Test",
    });

    const mockSendReply = vi
      .fn()
      .mockResolvedValue({ id: "test-id", error: null });

    vi.mocked(LLMService).mockImplementation(
      () =>
        ({
          classifyEmail: mockClassifyEmail,
          generateReplyDraft: vi.fn().mockResolvedValue("Test reply"),
        }) as any
    );

    vi.mocked(ResendService).mockImplementation(
      () =>
        ({
          sendReply: mockSendReply,
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

    // Agent uses Resend API for replies (no email operations) and email.forward() for forwarding
    // Total: 1 email operation (forward only)
    expect(replyCount).toBe(0); // No email.reply() calls
    expect(forwardCount).toBe(1); // Still forward for record-keeping
    expect(mockSendReply).toHaveBeenCalled(); // Resend was used
  }, 15000);

  it("should always forward regardless of action", async () => {
    const ctx = createExecutionContext();

    const { LLMService } = await import("@/services/llm");
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

  it("should reply to original sender (msg.from), not routing address (email.to)", async () => {
    const ctx = createExecutionContext();

    const { LLMService } = await import("@/services/llm");
    const { ResendService } = await import("@/services/resend");

    const mockClassifyEmail = vi.fn().mockResolvedValue({
      intents: ["question"],
      risk: "low",
      action: "reply",
      requires_approval: false,
      comments: "Test",
    });

    const mockSendReply = vi
      .fn()
      .mockResolvedValue({ id: "test-id", error: null });

    vi.mocked(LLMService).mockImplementation(
      () =>
        ({
          classifyEmail: mockClassifyEmail,
          generateReplyDraft: vi.fn().mockResolvedValue("Test reply"),
        }) as any
    );

    vi.mocked(ResendService).mockImplementation(
      () =>
        ({
          sendReply: mockSendReply,
        }) as any
    );

    const email = createMockEmailHelper({
      from: EXTERNAL_EMAIL,
      to: ROUTING_EMAIL,
      headers: new Headers({
        "Message-ID": "<test@example.com>",
      }),
      reply: async () => {
        // Should not be called
      },
      forward: async () => {
        // no-op
      },
    });

    await worker.email(email, env);
    await waitOnExecutionContext(ctx);

    // Critical: Reply should be sent to the original sender (EXTERNAL_EMAIL),
    // NOT to the routing address (ROUTING_EMAIL or env.EMAIL_ROUTING_ADDRESS)
    // Bug: "rcpt to is different from original sender" occurs when this is wrong
    expect(mockSendReply).toHaveBeenCalled();
    const callArgs = mockSendReply.mock.calls[0][0];
    expect(callArgs.to).toBe(EXTERNAL_EMAIL);
    expect(callArgs.to).not.toBe(ROUTING_EMAIL);
    expect(callArgs.from).toBe(env.EMAIL_ROUTING_ADDRESS);
  }, 15000);
});
