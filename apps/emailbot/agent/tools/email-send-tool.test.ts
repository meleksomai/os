import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Memory } from "../types";
import { clearTranscript } from "../utils/logger";
import { sendEmailTool } from "./email-send-tool";

// Mock Resend
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}));

// Import mocked Resend to control behavior per test
import { Resend } from "resend";
import type { ToolResult } from "../workflows/agent";

const mockEnv: Env = {
  EMAIL_ROUTING_ADDRESS: "agent@example.com",
  EMAIL_ROUTING_DESTINATION: "owner@example.com",
  RESEND_API_KEY: "test-api-key",
} as Env;

const createState = (overrides: Partial<Memory> = {}): Memory => ({
  lastUpdated: new Date().toISOString(),
  messages: [],
  context: "",
  summary: "",
  contact: "contact@example.com",
  ...overrides,
});

const createMessage = (overrides = {}) => ({
  date: new Date().toISOString(),
  from: "contact@example.com",
  to: "owner@example.com",
  subject: "Test Subject",
  raw: "Test content",
  messageId: "<message-123@example.com>",
  ...overrides,
});

describe("sendEmailTool", () => {
  beforeEach(() => {
    clearTranscript();
    vi.clearAllMocks();
  });

  describe("recipient resolution", () => {
    it("should send to contact when recipient is 'contact'", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState({ contact: "john@example.com" });
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "contact", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          cc: undefined,
        })
      );
    });

    it("should send to owner when recipient is 'owner'", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "owner@example.com",
          cc: undefined,
        })
      );
    });

    it("should send to contact with cc to owner when recipient is 'both'", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState({ contact: "john@example.com" });
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "both", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          cc: "owner@example.com",
        })
      );
    });

    it("should always use EMAIL_ROUTING_ADDRESS as from address", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "agent@example.com",
        })
      );
    });
  });

  describe("contact validation", () => {
    it("should return error when contact is null and recipient is 'contact'", async () => {
      const state = createState({ contact: null });
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "contact", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result?.data?.id).toBeNull();
      expect(result?.data?.error).toBe("No contact address available in state");
    });

    it("should return error when contact is null and recipient is 'both'", async () => {
      const state = createState({ contact: null });
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "both", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result?.data.id).toBeNull();
      expect(result?.data.error).toBe("No contact address available in state");
    });

    it("should succeed when contact is null but recipient is 'owner'", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState({ contact: null });
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result?.data.id).toBe("email-1");
      expect(result?.data.error).toBeNull();
    });
  });

  describe("subject line formatting", () => {
    it("should add 'Re:' prefix when not present", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "owner", subject: "Hello World", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Re: Hello World",
        })
      );
    });

    it("should not double 'Re:' when already present", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "owner", subject: "Re: Hello World", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Re: Hello World",
        })
      );
    });
  });

  describe("email threading", () => {
    it("should set In-Reply-To header from last message", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState({
        messages: [createMessage({ messageId: "<original-123@example.com>" })],
      });
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "In-Reply-To": "<original-123@example.com>",
          }),
        })
      );
    });

    it("should build References header from last message", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState({
        messages: [
          createMessage({
            messageId: "<msg-2@example.com>",
            references: ["<msg-1@example.com>"],
          }),
        ],
      });
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            References: "<msg-2@example.com> <msg-1@example.com>",
          }),
        })
      );
    });

    it("should handle empty messages array", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState({ messages: [] });
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "In-Reply-To": "",
            References: "",
          }),
        })
      );
    });

    it("should handle message without messageId", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState({
        messages: [createMessage({ messageId: null })],
      });
      const tool = sendEmailTool(mockEnv, state);

      await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "In-Reply-To": "",
            References: "",
          }),
        })
      );
    });
  });

  describe("Resend API responses", () => {
    it("should return email id on success", async () => {
      const mockSend = vi
        .fn()
        .mockResolvedValue({ data: { id: "sent-email-123" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result?.data.id).toBe("sent-email-123");
      expect(result?.data.error).toBeNull();
    });

    it("should return error when Resend returns error object", async () => {
      const mockSend = vi
        .fn()
        .mockResolvedValue({ error: { message: "Invalid API key" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result?.data.id).toBeNull();
      expect(result?.data.error).toBe("Invalid API key");
    });

    it("should return error when Resend returns no data", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: null });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result?.data.id).toBeNull();
      expect(result?.data.error).toBe("No data returned from Resend");
    });

    it("should catch and return thrown exceptions", async () => {
      const mockSend = vi.fn().mockRejectedValue(new Error("Network failure"));
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result?.data.id).toBeNull();
      expect(result?.data.error).toBe("Network failure");
    });

    it("should handle non-Error thrown values", async () => {
      const mockSend = vi.fn().mockRejectedValue("String error");
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result?.data.id).toBeNull();
      expect(result?.data.error).toBe("String error");
    });
  });

  describe("return type", () => {
    it("should always return ToolResult shape with data object", async () => {
      const mockSend = vi.fn().mockResolvedValue({ data: { id: "email-1" } });
      vi.mocked(Resend).mockImplementation(
        () => ({ emails: { send: mockSend } }) as unknown as Resend
      );

      const state = createState();
      const tool = sendEmailTool(mockEnv, state);

      const result = (await tool.execute?.(
        { recipient: "owner", subject: "Test", content: "Hello" },
        { messages: [], toolCallId: "test-1" }
      )) as ToolResult<any> | null;

      expect(result).toHaveProperty("data");
      expect(result?.data).toHaveProperty("id");
      expect(result?.data).toHaveProperty("error");
    });
  });
});
