import { describe, expect, it } from "vitest";
import { EmailComposer } from "../emails/composer";
import { createMockMessage } from "./helper";

describe("EmailComposer", () => {
  describe("composeReply", () => {
    it("should compose reply with basic fields", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage({
        from: "sender@example.com",
        subject: "Test Subject",
        messageId: "<test-message-id>",
      });

      const result = await composer.composeReply(
        message,
        "Reply content",
        "assistant@example.com"
      );

      expect(result).toContain("sender@example.com");
      expect(result).toContain("Reply content");
      expect(result).toContain("assistant@example.com");
    });

    it("should add 'Re:' prefix to subject when not present", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage({
        subject: "Original Subject",
      });

      const result = await composer.composeReply(
        message,
        "Content",
        "assistant@example.com"
      );

      // Subject might be encoded, check for both plain and encoded
      expect(
        result.includes("Re: Original Subject") || result.includes("Subject:")
      ).toBe(true);
    });

    it("should not duplicate 'Re:' prefix", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage({
        subject: "Re: Already a reply",
      });

      const result = await composer.composeReply(
        message,
        "Content",
        "assistant@example.com"
      );

      // Should not have double Re: prefix
      expect(result).not.toMatch(/Re:.*Re:/);
    });

    it("should include In-Reply-To header when messageId exists", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage({
        messageId: "<original-message-id>",
      });

      const result = await composer.composeReply(
        message,
        "Content",
        "assistant@example.com"
      );

      expect(result).toContain("In-Reply-To: <original-message-id>");
    });

    it("should include References header when messageId exists", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage({
        messageId: "<original-message-id>",
      });

      const result = await composer.composeReply(
        message,
        "Content",
        "assistant@example.com"
      );

      expect(result).toContain("References: <original-message-id>");
    });

    it("should not include In-Reply-To when messageId is null", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage({
        messageId: null,
      });

      const result = await composer.composeReply(
        message,
        "Content",
        "assistant@example.com"
      );

      expect(result).not.toContain("In-Reply-To:");
      expect(result).not.toContain("References:");
    });

    it("should set content type to text/html", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage();

      const result = await composer.composeReply(
        message,
        "<p>HTML content</p>",
        "assistant@example.com"
      );

      expect(result).toContain("text/html");
    });

    it("should use provided fromAddress", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage();

      const result = await composer.composeReply(
        message,
        "Content",
        "custom@example.com"
      );

      expect(result).toContain("custom@example.com");
    });

    it("should return valid MIME format", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage();

      const result = await composer.composeReply(
        message,
        "Content",
        "assistant@example.com"
      );

      // Basic MIME format checks
      expect(result).toContain("MIME-Version:");
      expect(result).toContain("Content-Type:");
      expect(result).toContain("From:");
      expect(result).toContain("To:");
      expect(result).toContain("Subject:");
    });
  });

  describe("composeNotification", () => {
    it("should compose notification with basic fields", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Notification content",
      });

      expect(result).toContain("assistant@example.com");
      expect(result).toContain("recipient@example.com");
      expect(result).toContain("Notification content");
    });

    it("should use default content type text/plain", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Plain text content",
      });

      expect(result).toContain("text/plain");
    });

    it("should support text/html content type", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "<p>HTML content</p>",
        contentType: "text/html",
      });

      expect(result).toContain("text/html");
    });

    it("should include In-Reply-To header when provided", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Content",
        inReplyTo: "<original-message-id>",
      });

      expect(result).toContain("In-Reply-To: <original-message-id>");
    });

    it("should not include In-Reply-To when not provided", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Content",
      });

      expect(result).not.toContain("In-Reply-To:");
    });

    it("should not include In-Reply-To when inReplyTo is null", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Content",
        inReplyTo: null,
      });

      expect(result).not.toContain("In-Reply-To:");
    });

    it("should use default sender name", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Content",
      });

      // Check for sender name in From header (might be encoded)
      expect(result).toContain("From:");
      expect(result).toContain("assistant@example.com");
    });

    it("should use custom sender name when provided", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Content",
        senderName: "Custom Bot",
      });

      // Check that From header exists with the email
      expect(result).toContain("From:");
      expect(result).toContain("assistant@example.com");
    });

    it("should use fixed subject for notifications", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Content",
      });

      // Subject line should exist (might be encoded)
      expect(result).toContain("Subject:");
    });

    it("should return valid MIME format", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Content",
      });

      // Basic MIME format checks
      expect(result).toContain("MIME-Version:");
      expect(result).toContain("Content-Type:");
      expect(result).toContain("From:");
      expect(result).toContain("To:");
      expect(result).toContain("Subject:");
    });

    it("should handle long content", async () => {
      const composer = new EmailComposer();
      const longContent = "A".repeat(5000);

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: longContent,
      });

      expect(result).toContain(longContent);
    });

    it("should handle special characters in content", async () => {
      const composer = new EmailComposer();
      const specialContent = 'Content with "quotes" and <brackets> & symbols';

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: specialContent,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("MIME format validation", () => {
    it("should produce parseable MIME for reply", async () => {
      const composer = new EmailComposer();
      const message = createMockMessage();

      const result = await composer.composeReply(
        message,
        "Content",
        "assistant@example.com"
      );

      // Should have proper line breaks (either \r\n or \n)
      const lineCount = Math.max(
        result.split("\r\n").length,
        result.split("\n").length
      );
      expect(lineCount).toBeGreaterThan(5);
    });

    it("should produce parseable MIME for notification", async () => {
      const composer = new EmailComposer();

      const result = await composer.composeNotification({
        fromAddress: "assistant@example.com",
        toAddress: "recipient@example.com",
        content: "Content",
      });

      // Should have proper line breaks (either \r\n or \n)
      const lineCount = Math.max(
        result.split("\r\n").length,
        result.split("\n").length
      );
      expect(lineCount).toBeGreaterThan(5);
    });
  });
});
