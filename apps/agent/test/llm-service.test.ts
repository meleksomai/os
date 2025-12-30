import { beforeEach, describe, expect, it, vi } from "vitest";
import { LLMService } from "../llm-service";
import { createMockEmailClassification, createMockMessage } from "./helper";

// Mock the AI SDK
vi.mock("ai", async () => {
  const actual = await vi.importActual("ai");
  return {
    ...actual,
    generateText: vi.fn(),
  };
});

// Mock @ai-sdk/openai
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => ({
    languageModel: vi.fn(() => ({ modelId: "gpt-5.2" })),
  })),
}));

// Mock email rendering
vi.mock("../emails/renderer", () => ({
  renderEmail: vi.fn((content: string) =>
    Promise.resolve(`<html>${content}</html>`)
  ),
}));

// Mock cloudflare:workers env
vi.mock("cloudflare:workers", () => ({
  env: {
    AI: {
      gateway: vi.fn(() => ({
        getUrl: vi.fn(async () => "https://mock-gateway.com"),
      })),
    },
    CLOUDFLARE_AI_GATEWAY_ID: "mock-gateway-id",
    CLOUDFLARE_AI_GATEWAY_TOKEN: "mock-token",
    OPENAI_API_KEY: "mock-api-key",
  },
}));

// Import after mocking
import { generateText } from "ai";
import { renderEmail } from "../emails/renderer";

describe("LLMService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should classify email using LLM", async () => {
    const mockClassification = createMockEmailClassification({
      intents: ["information_request"],
      risk: "low",
      action: "reply",
    });

    vi.mocked(generateText).mockResolvedValue({
      output: mockClassification,
    } as any);

    const service = new LLMService();
    const message = createMockMessage({
      from: "test@example.com",
      subject: "Test Subject",
    });

    const result = await service.classifyEmail(message, "test context");

    expect(generateText).toHaveBeenCalled();
    expect(result).toEqual(mockClassification);
  });

  it("should include message details in classification prompt", async () => {
    const mockClassification = createMockEmailClassification();

    vi.mocked(generateText).mockResolvedValue({
      output: mockClassification,
    } as any);

    const service = new LLMService();
    const message = createMockMessage({
      from: "sender@example.com",
      subject: "Important Question",
      raw: "What is the answer?",
    });

    await service.classifyEmail(message, "context info");

    const generateTextCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateTextCall?.prompt).toContain("sender@example.com");
    expect(generateTextCall?.prompt).toContain("Important Question");
    expect(generateTextCall?.prompt).toContain("What is the answer?");
    expect(generateTextCall?.prompt).toContain("context info");
  });

  it("should use classification system prompt", async () => {
    const mockClassification = createMockEmailClassification();

    vi.mocked(generateText).mockResolvedValue({
      output: mockClassification,
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    await service.classifyEmail(message, "");

    const generateTextCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateTextCall?.system).toBeDefined();
    expect(typeof generateTextCall?.system).toBe("string");
  });

  it("should generate reply draft using LLM", async () => {
    const mockReplyContent = "Thank you for your email. Here is my response.";

    vi.mocked(generateText).mockResolvedValue({
      output: mockReplyContent,
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    const result = await service.generateReplyDraft(message, "test context");

    expect(generateText).toHaveBeenCalled();
    expect(renderEmail).toHaveBeenCalledWith(mockReplyContent);
    expect(result).toContain("<html>");
  });

  it("should include message details in reply prompt", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: "Reply content",
    } as any);

    const service = new LLMService();
    const message = createMockMessage({
      from: "requester@example.com",
      subject: "Need Help",
      raw: "Can you help me with this?",
    });

    await service.generateReplyDraft(message, "additional context");

    const generateTextCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateTextCall?.prompt).toContain("requester@example.com");
    expect(generateTextCall?.prompt).toContain("Need Help");
    expect(generateTextCall?.prompt).toContain("Can you help me with this?");
    expect(generateTextCall?.prompt).toContain("additional context");
  });

  it("should use writer system prompt for reply", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: "Reply content",
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    await service.generateReplyDraft(message, "");

    const generateTextCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateTextCall?.system).toBeDefined();
    expect(typeof generateTextCall?.system).toBe("string");
  });

  it("should call generateText each time for classification", async () => {
    const mockClassification = createMockEmailClassification();

    vi.mocked(generateText).mockResolvedValue({
      output: mockClassification,
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    await service.classifyEmail(message, "");
    await service.classifyEmail(message, "");

    expect(generateText).toHaveBeenCalledTimes(2);
  });

  it("should call generateText each time for reply draft", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: "Reply",
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    await service.generateReplyDraft(message, "");
    await service.generateReplyDraft(message, "");

    expect(generateText).toHaveBeenCalledTimes(2);
  });

  it("should pass correct schema for classification", async () => {
    const mockClassification = createMockEmailClassification();

    vi.mocked(generateText).mockResolvedValue({
      output: mockClassification,
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    await service.classifyEmail(message, "");

    const generateTextCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateTextCall?.output).toBeDefined();
  });

  it("should render email content after generating text", async () => {
    const rawContent = "This is the raw LLM output";

    vi.mocked(generateText).mockResolvedValue({
      output: rawContent,
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    await service.generateReplyDraft(message, "");

    expect(renderEmail).toHaveBeenCalledWith(rawContent);
  });

  it("should handle empty context in classification", async () => {
    const mockClassification = createMockEmailClassification();

    vi.mocked(generateText).mockResolvedValue({
      output: mockClassification,
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    await service.classifyEmail(message, "");

    const generateTextCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateTextCall?.prompt).toContain("Classify the following email");
  });

  it("should handle empty context in reply draft", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: "Reply",
    } as any);

    const service = new LLMService();
    const message = createMockMessage();

    await service.generateReplyDraft(message, "");

    const generateTextCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateTextCall?.prompt).toContain("Draft a reply");
  });
});
