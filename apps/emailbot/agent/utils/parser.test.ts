import type { AgentEmail } from "agents";
import { describe, expect, it, vi } from "vitest";
import { EmailParser } from "./parser";

describe("EmailParser", () => {
  it("should parse email with HTML content", async () => {
    const parser = new EmailParser();

    const mockEmail: Partial<AgentEmail> = {
      from: "sender@example.com",
      to: "recipient@example.com",
      headers: new Headers({ "Message-ID": "test-message-id" }),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender@example.com\r\nTo: recipient@example.com\r\nSubject: Test Subject\r\n\r\n<p>HTML content</p>"
          )
        ),
    };

    const result = await parser.parse(mockEmail as AgentEmail);

    expect(result.from).toBe("sender@example.com");
    expect(result.to).toBe("recipient@example.com");
    expect(result.subject).toBe("Test Subject");
    expect(result.messageId).toBe("test-message-id");
    expect(typeof result.date).toBe("string");
  });

  it("should parse email with plain text content", async () => {
    const parser = new EmailParser();

    const mockEmail: Partial<AgentEmail> = {
      from: "sender@example.com",
      to: "recipient@example.com",
      headers: new Headers(),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender@example.com\r\nTo: recipient@example.com\r\nSubject: Plain Text\r\n\r\nPlain text content"
          )
        ),
    };

    const result = await parser.parse(mockEmail as AgentEmail);

    expect(result.from).toBe("sender@example.com");
    expect(result.subject).toBe("Plain Text");
    expect(typeof result.raw).toBe("string");
  });

  it("should use '(No Subject)' when subject is missing", async () => {
    const parser = new EmailParser();

    const mockEmail: Partial<AgentEmail> = {
      from: "sender@example.com",
      to: "recipient@example.com",
      headers: new Headers(),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender@example.com\r\nTo: recipient@example.com\r\n\r\nNo subject email"
          )
        ),
    };

    const result = await parser.parse(mockEmail as AgentEmail);

    expect(result.subject).toBe("(No Subject)");
  });

  it("should extract Message-ID from headers", async () => {
    const parser = new EmailParser();

    const mockEmail: Partial<AgentEmail> = {
      from: "sender@example.com",
      to: "recipient@example.com",
      headers: new Headers({ "Message-ID": "<header-message-id>" }),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender@example.com\r\nTo: recipient@example.com\r\nSubject: Test\r\n\r\nContent"
          )
        ),
    };

    const result = await parser.parse(mockEmail as AgentEmail);

    expect(result.messageId).toBe("<header-message-id>");
  });

  it("should fallback to parsed messageId when header is missing", async () => {
    const parser = new EmailParser();

    const mockEmail: Partial<AgentEmail> = {
      from: "sender@example.com",
      to: "recipient@example.com",
      headers: new Headers(),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender@example.com\r\nTo: recipient@example.com\r\nMessage-ID: <parsed-message-id>\r\nSubject: Test\r\n\r\nContent"
          )
        ),
    };

    const result = await parser.parse(mockEmail as AgentEmail);

    expect(result.messageId).toBe("<parsed-message-id>");
  });

  it("should return null messageId when not present", async () => {
    const parser = new EmailParser();

    const mockEmail: Partial<AgentEmail> = {
      from: "sender@example.com",
      to: "recipient@example.com",
      headers: new Headers(),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender@example.com\r\nTo: recipient@example.com\r\nSubject: Test\r\n\r\nContent"
          )
        ),
    };

    const result = await parser.parse(mockEmail as AgentEmail);

    expect(result.messageId).toBeNull();
  });

  it("should validate output with Zod schema", async () => {
    const parser = new EmailParser();

    const mockEmail: Partial<AgentEmail> = {
      from: "sender@example.com",
      to: "recipient@example.com",
      headers: new Headers(),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender@example.com\r\nTo: recipient@example.com\r\nSubject: Test\r\n\r\nContent"
          )
        ),
    };

    const result = await parser.parse(mockEmail as AgentEmail);

    // Should have all required fields
    expect(result).toHaveProperty("date");
    expect(result).toHaveProperty("from");
    expect(result).toHaveProperty("to");
    expect(result).toHaveProperty("subject");
    expect(result).toHaveProperty("raw");
    expect(result).toHaveProperty("messageId");
  });

  it("should prefer HTML over text content", async () => {
    const parser = new EmailParser();

    const mockEmail: Partial<AgentEmail> = {
      from: "sender@example.com",
      to: "recipient@example.com",
      headers: new Headers(),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            'From: sender@example.com\r\nTo: recipient@example.com\r\nSubject: Test\r\nContent-Type: multipart/alternative; boundary="boundary"\r\n\r\n--boundary\r\nContent-Type: text/plain\r\n\r\nPlain text\r\n--boundary\r\nContent-Type: text/html\r\n\r\n<p>HTML content</p>\r\n--boundary--'
          )
        ),
    };

    const result = await parser.parse(mockEmail as AgentEmail);

    expect(result.raw).toContain("HTML");
  });

  it("should be able to parse multiple emails with the same parser instance", async () => {
    // This test demonstrates a bug: EmailParser reuses a PostalMime instance
    // which cannot be reused. The second parse() call will fail.
    const parser = new EmailParser();

    const email1: Partial<AgentEmail> = {
      from: "sender1@example.com",
      to: "recipient@example.com",
      headers: new Headers({ "Message-ID": "message-1" }),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender1@example.com\r\nTo: recipient@example.com\r\nSubject: Email 1\r\n\r\nFirst email"
          )
        ),
    };

    const email2: Partial<AgentEmail> = {
      from: "sender2@example.com",
      to: "recipient@example.com",
      headers: new Headers({ "Message-ID": "message-2" }),
      getRaw: async () =>
        new Uint8Array(
          Buffer.from(
            "From: sender2@example.com\r\nTo: recipient@example.com\r\nSubject: Email 2\r\n\r\nSecond email"
          )
        ),
    };

    // Parse first email - this works fine
    const result1 = await parser.parse(email1 as AgentEmail);
    expect(result1.from).toBe("sender1@example.com");
    expect(result1.subject).toBe("Email 1");

    // Parse second email with the same parser instance
    const result2 = await parser.parse(email2 as AgentEmail);
    expect(result2.from).toBe("sender2@example.com");
    expect(result2.subject).toBe("Email 2");
  });
});
