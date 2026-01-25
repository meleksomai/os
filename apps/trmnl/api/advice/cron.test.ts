/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: unit testing */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cronJob } from "./cron";

// Mock dependencies
vi.mock("@/api/advice/utils", () => ({
  generateAndCacheAdvice: vi.fn(),
}));

import { generateAndCacheAdvice } from "@/api/advice/utils";

describe("cronJob", () => {
  const mockEnv = {
    BABY_DOB: "2024-01-15",
    TRMNL_CACHE_KV: {} as KVNamespace,
  } as Env;

  const mockController = {} as ScheduledController;
  const mockCtx = {} as ExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("logs when cron is triggered", async () => {
    vi.mocked(generateAndCacheAdvice).mockResolvedValue({
      date: "2024-06-15T10:00:00.000Z",
      summary: "Test advice",
      age: "5 months old",
    });

    await cronJob(mockController, mockEnv, mockCtx);

    expect(console.log).toHaveBeenCalledWith("cron processing triggered...");
  });

  it("calls generateAndCacheAdvice with env", async () => {
    vi.mocked(generateAndCacheAdvice).mockResolvedValue({
      date: "2024-06-15T10:00:00.000Z",
      summary: "Test advice",
      age: "5 months old",
    });

    await cronJob(mockController, mockEnv, mockCtx);

    expect(generateAndCacheAdvice).toHaveBeenCalledWith(mockEnv);
  });

  it("awaits the advice generation", async () => {
    let resolved = false;
    vi.mocked(generateAndCacheAdvice).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      resolved = true;
      return {
        date: "2024-06-15T10:00:00.000Z",
        summary: "Test advice",
        age: "5 months old",
      };
    });

    await cronJob(mockController, mockEnv, mockCtx);

    expect(resolved).toBe(true);
  });
});
