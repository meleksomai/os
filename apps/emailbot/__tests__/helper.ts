import { EmailComposer } from "@/emails/composer";
import { EmailParser } from "@/emails/parser";
import { LLMService } from "@/llm-service";
import { MemoryManager } from "@/memory-manager";
import type { EmailClassification, Memory, Message } from "../agent/types";

/**
 * Create a mock email for testing with Cloudflare email operation limits
 *
 * Cloudflare limits:
 * - Maximum 2 operations (reply/forward) per email
 * - Exceeding this throws "original email is not repliable or exceeds reply limit"
 */
export const createMockEmailHelper = (
  overrides: Partial<ForwardableEmailMessage> & {
    getRaw?: () => Promise<string | Uint8Array>;
    enforceOperationLimits?: boolean; // Enable Cloudflare-like limits
  } = {}
): ForwardableEmailMessage & { getRaw: () => Promise<string | Uint8Array> } => {
  const encoder = new TextEncoder();
  const streamBody = encoder.encode("Test body");

  // Track email operations to simulate Cloudflare limits
  let operationCount = 0;
  const MAX_OPERATIONS = 2;
  const enforceOperationLimits = overrides.enforceOperationLimits ?? false;

  const checkOperationLimit = () => {
    if (enforceOperationLimits && operationCount >= MAX_OPERATIONS) {
      throw new Error("original email is not repliable or exceeds reply limit");
    }
    operationCount++;
  };

  const messageId =
    overrides.headers?.get("Message-ID") ?? "<test-message@example.com>";
  const from = overrides.from ?? "sender@example.com";
  const to = overrides.to ?? "recipient@example.com";

  // Create a valid MIME email with proper headers
  const validMimeEmail = `Message-ID: ${messageId}
From: ${from}
To: ${to}
Subject: Test Subject
Date: ${new Date().toUTCString()}
Content-Type: text/plain; charset=utf-8

Test body`;

  return {
    from,
    to,
    raw:
      overrides.raw ??
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(streamBody);
          controller.close();
        },
      }),
    headers: overrides.headers ?? new Headers(),
    rawSize: overrides.rawSize ?? streamBody.byteLength,
    setReject: overrides.setReject ?? (() => {}),
    forward:
      overrides.forward ??
      (async () => {
        checkOperationLimit();
      }),
    reply:
      overrides.reply ??
      (async (_message: EmailMessage) => {
        checkOperationLimit();
      }),
    getRaw:
      overrides.getRaw ??
      (() => {
        return Promise.resolve(validMimeEmail);
      }),
  };
};

/**
 * Create a mock Message for testing
 */
export const createMockMessage = (
  overrides: Partial<Message> = {}
): Message => ({
  date: overrides.date ?? new Date(),
  from: overrides.from ?? "sender@example.com",
  to: overrides.to ?? "recipient@example.com",
  subject: overrides.subject ?? "Test Subject",
  raw: overrides.raw ?? "Test content",
  messageId:
    overrides.messageId !== undefined ? overrides.messageId : "message-id-123",
  cc: overrides.cc,
  inReplyTo: overrides.inReplyTo,
  references: overrides.references,
});

/**
 * Create a mock Memory state for testing
 */
export const createMockMemory = (overrides: Partial<Memory> = {}): Memory => ({
  lastUpdated: overrides.lastUpdated ?? new Date(),
  messages: overrides.messages ?? [],
  context: overrides.context ?? "",
  summary: overrides.summary ?? "",
  hasAutoReplied: overrides.hasAutoReplied ?? false,
});

/**
 * Create a mock EmailClassification for testing
 */
export const createMockEmailClassification = (
  overrides: Partial<EmailClassification> = {}
): EmailClassification => ({
  intents: overrides.intents ?? ["information_request"],
  risk: overrides.risk ?? "low",
  action: overrides.action ?? "reply",
  requires_approval: overrides.requires_approval ?? false,
  comments:
    overrides.comments ?? "Test classification with standard reply action.",
});

/**
 * Create a mock EmailParser for testing
 */
export const createMockEmailParser = (
  overrides: Partial<EmailParser> = {}
): EmailParser =>
  ({
    parse: overrides.parse ?? (async () => createMockMessage()),
  }) as EmailParser;

/**
 * Create a mock MemoryManager for testing
 */
export const createMockMemoryManager = (
  overrides: Partial<MemoryManager> = {}
): MemoryManager =>
  ({
    getState: overrides.getState ?? (() => createMockMemory()),
    storeMessage: overrides.storeMessage ?? (async () => {}),
    appendContext: overrides.appendContext ?? (async () => {}),
    updateState: overrides.updateState ?? (async () => {}),
  }) as MemoryManager;

/**
 * Create a mock LLMService for testing
 */
export const createMockLLMService = (
  overrides: Partial<LLMService> = {}
): LLMService =>
  ({
    classifyEmail:
      overrides.classifyEmail ?? (async () => createMockEmailClassification()),
    generateReplyDraft:
      overrides.generateReplyDraft ?? (async () => "Test reply content"),
  }) as LLMService;

/**
 * Create a mock EmailComposer for testing
 */
export const createMockEmailComposer = (
  overrides: Partial<EmailComposer> = {}
): EmailComposer => ({
  composeReply: overrides.composeReply ?? (async () => "Raw MIME reply"),
  composeNotification:
    overrides.composeNotification ?? (async () => "Raw MIME notification"),
});
