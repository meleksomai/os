import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateAndCacheAdvice } from "./utils";

// Mock dependencies
vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@/utils/model", () => ({
  retrieveModel: vi.fn(),
}));

vi.mock("@/utils/cache", () => ({
  setAdvice: vi.fn(),
}));

vi.mock("@/utils/calculate-age", () => ({
  calculateAge: vi.fn(),
}));

vi.mock("@/api/advice/prompt", () => ({
  prompt: vi.fn((age) => `Test prompt for ${age.description}`),
}));

import { generateText } from "ai";
import { setAdvice } from "@/utils/cache";
import { calculateAge } from "@/utils/calculate-age";
import { retrieveModel } from "@/utils/model";

describe("generateAndCacheAdvice", () => {
  const mockEnv = {
    BABY_DOB: "2024-01-15",
    TRMNL_CACHE_KV: {} as KVNamespace,
    OPENAI_API_KEY: "test-key",
  } as Env;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T10:00:00Z"));

    vi.mocked(calculateAge).mockReturnValue({
      years: 0,
      months: 5,
      days: 0,
      totalMonths: 5,
      description: "5 months old",
      dob: "2024-01-15",
    });

    vi.mocked(retrieveModel).mockResolvedValue(
      {} as ReturnType<typeof retrieveModel> extends Promise<infer T>
        ? T
        : never
    );

    vi.mocked(generateText).mockResolvedValue({
      text: "Test advice content",
    } as Awaited<ReturnType<typeof generateText>>);

    vi.mocked(setAdvice).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("calculates age from env.BABY_DOB", async () => {
    await generateAndCacheAdvice(mockEnv);

    expect(calculateAge).toHaveBeenCalledWith("2024-01-15");
  });

  it("retrieves the AI model", async () => {
    await generateAndCacheAdvice(mockEnv);

    expect(retrieveModel).toHaveBeenCalledWith(mockEnv);
  });

  it("generates text using the model", async () => {
    await generateAndCacheAdvice(mockEnv);

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("5 months old"),
      })
    );
  });

  it("caches the generated advice", async () => {
    await generateAndCacheAdvice(mockEnv);

    expect(setAdvice).toHaveBeenCalledWith(
      mockEnv.TRMNL_CACHE_KV,
      expect.objectContaining({
        summary: "Test advice content",
        age: "5 months old",
      }),
      "5 months old"
    );
  });

  it("returns the generated advice", async () => {
    const result = await generateAndCacheAdvice(mockEnv);

    expect(result).toEqual({
      date: "2024-06-15T10:00:00.000Z",
      summary: "Test advice content",
      age: "5 months old",
    });
  });

  it("includes ISO date in the advice", async () => {
    const result = await generateAndCacheAdvice(mockEnv);

    expect(result.date).toBe("2024-06-15T10:00:00.000Z");
  });
});
