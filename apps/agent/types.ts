import type { AgentEmail } from "agents";
import { z } from "zod";

/**
 * Sender type classification for email triage
 */
export type SenderType = "self" | "agent" | "external";

/**
 * Email intent classification
 */
export const EmailIntentSchema = z.enum([
  "scheduling",
  "information_request",
  "action_request",
  "introduction_networking",
  "sales_vendor",
  "fyi_notification",
  "sensitive_legal_financial",
  "unknown_ambiguous",
]);

export type EmailIntent = z.infer<typeof EmailIntentSchema>;

/**
 * Email classification schema and type
 */
export const EmailClassificationSchema = z.object({
  intents: z.array(EmailIntentSchema).min(1),
  risk: z.enum(["low", "medium", "high"]),
  action: z.enum(["reply", "forward", "ignore"]),
  requires_approval: z.boolean(),
  comments: z.string().min(1).max(500),
});

export type EmailClassification = z.infer<typeof EmailClassificationSchema>;

/**
 * Parsed email message
 */
export type Message = {
  date: Date;
  from: string;
  to: string;
  subject: string;
  raw: string | Uint8Array<ArrayBufferLike>;
  messageId: string | null;
};

/**
 * Zod schema for Message validation
 */
export const MessageSchema = z.object({
  date: z.date(),
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string(),
  raw: z.union([z.string(), z.instanceof(Uint8Array)]),
  messageId: z.string().nullable(),
});

/**
 * Agent memory state
 */
export type Memory = {
  lastUpdated: Date | null;
  messages: Message[];
  context: string;
  summary: string;
};

/**
 * Zod schema for Memory validation
 */
export const MemorySchema = z.object({
  lastUpdated: z.date().nullable(),
  messages: z.array(MessageSchema),
  context: z.string(),
  summary: z.string(),
});

/**
 * Options for composing notification emails
 */
export type NotificationOptions = {
  fromAddress: string;
  toAddress: string;
  content: string;
  contentType?: "text/plain" | "text/html";
  inReplyTo?: string | null;
  senderName?: string;
};

/**
 * Zod schema for NotificationOptions validation
 */
export const NotificationOptionsSchema = z.object({
  fromAddress: z.email(),
  toAddress: z.email(),
  content: z.string(),
  contentType: z.enum(["text/plain", "text/html"]).optional(),
  inReplyTo: z.string().nullable().optional(),
  senderName: z.string().optional(),
});

/**
 * Email parser interface
 */
export interface IEmailParser {
  /**
   * Parse raw email into structured Message
   */
  parse(email: AgentEmail): Promise<Message>;
}

/**
 * Memory manager interface
 */
export interface IMemoryManager {
  /**
   * Get current agent state
   */
  getState(): Memory;

  /**
   * Store a message in agent memory
   */
  storeMessage(message: Message): Promise<void>;

  /**
   * Store a message as context (for internal emails)
   */
  storeContext(message: Message): Promise<void>;

  /**
   * Update agent state with partial updates
   */
  updateState(updates: Partial<Memory>): Promise<void>;
}

/**
 * LLM service interface
 */
export interface ILLMService {
  /**
   * Classify an email using LLM
   */
  classifyEmail(
    message: Message,
    context: string
  ): Promise<EmailClassification>;

  /**
   * Generate a reply draft for an email using LLM
   */
  generateReplyDraft(message: Message, context: string): Promise<string>;
}

/**
 * Email composer interface
 */
export interface IEmailComposer {
  /**
   * Compose a reply email as raw MIME
   */
  composeReply(
    message: Message,
    content: string,
    fromAddress: string
  ): Promise<string>;

  /**
   * Compose a notification email as raw MIME
   */
  composeNotification(options: NotificationOptions): Promise<string>;
}
