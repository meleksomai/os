import { z } from "zod";

/**
 * Sender type classification for email triage
 */
export type SenderType = "self" | "agent" | "external";

/**
 * Zod schema for Message validation
 * Uses ISO date strings for JSON Schema compatibility
 */
export const MessageSchema = z.object({
  date: z.string().describe("ISO 8601 date string"),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  raw: z.string(),
  messageId: z.string().nullable(),
  cc: z.array(z.string()).optional(),
  inReplyTo: z.string().nullable().optional(),
  references: z.array(z.string()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Zod schema for Memory validation
 * Uses ISO date strings for JSON Schema compatibility
 */
export const MemorySchema = z.object({
  lastUpdated: z.string().nullable().describe("ISO 8601 date string or null"),
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
