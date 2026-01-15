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
 * Zod schema for Message validation
 */
export const MessageSchema = z.object({
  date: z.date(),
  from: z.email(),
  to: z.email(),
  subject: z.string(),
  raw: z.string(),
  messageId: z.string().nullable(),
  cc: z.array(z.email()).optional(),
  inReplyTo: z.string().nullable().optional(),
  references: z.array(z.string()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Zod schema for Memory validation
 */
export const MemorySchema = z.object({
  lastUpdated: z.date().nullable(),
  messages: z.array(MessageSchema),
  context: z.string(),
  summary: z.string(),
});

export type Memory = z.infer<typeof MemorySchema>;

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

export type NotificationOptions = z.infer<typeof NotificationOptionsSchema>;
