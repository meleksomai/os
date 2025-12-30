import type {
  EmailClassification,
  IEmailComposer,
  IEmailParser,
  ILLMService,
  IMemoryManager,
  Memory,
  Message,
  NotificationOptions,
} from "../types";

/**
 * Create a mock email for testing
 */
export const createMockEmailHelper = (
  overrides: Partial<ForwardableEmailMessage> = {}
): ForwardableEmailMessage => {
  const encoder = new TextEncoder();
  const streamBody = encoder.encode("Test body");

  return {
    from: overrides.from ?? "sender@example.com",
    to: overrides.to ?? "recipient@example.com",
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
    forward: overrides.forward ?? (async () => {}),
    reply: overrides.reply ?? (async (_message: EmailMessage) => {}),
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
});

/**
 * Create a mock Memory state for testing
 */
export const createMockMemory = (overrides: Partial<Memory> = {}): Memory => ({
  lastUpdated: overrides.lastUpdated ?? new Date(),
  messages: overrides.messages ?? [],
  context: overrides.context ?? "",
  summary: overrides.summary ?? "",
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
  overrides: Partial<IEmailParser> = {}
): IEmailParser => ({
  parse: overrides.parse ?? (async () => createMockMessage()),
});

/**
 * Create a mock MemoryManager for testing
 */
export const createMockMemoryManager = (
  overrides: Partial<IMemoryManager> = {}
): IMemoryManager => ({
  getState: overrides.getState ?? (() => createMockMemory()),
  storeMessage: overrides.storeMessage ?? (async () => {}),
  appendContext: overrides.appendContext ?? (async () => {}),
  updateState: overrides.updateState ?? (async () => {}),
});

/**
 * Create a mock LLMService for testing
 */
export const createMockLLMService = (
  overrides: Partial<ILLMService> = {}
): ILLMService => ({
  classifyEmail:
    overrides.classifyEmail ?? (async () => createMockEmailClassification()),
  generateReplyDraft:
    overrides.generateReplyDraft ?? (async () => "Test reply content"),
});

/**
 * Create a mock EmailComposer for testing
 */
export const createMockEmailComposer = (
  overrides: Partial<IEmailComposer> = {}
): IEmailComposer => ({
  composeReply: overrides.composeReply ?? (async () => "Raw MIME reply"),
  composeNotification:
    overrides.composeNotification ?? (async () => "Raw MIME notification"),
});
