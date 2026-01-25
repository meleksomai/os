import { beforeEach, describe, expect, it, vi } from "vitest";
import advice from "./route";

// Mock dependencies
vi.mock("@/utils/cache", () => ({
  getAdvice: vi.fn(),
}));

vi.mock("@/api/advice/utils", () => ({
  generateAndCacheAdvice: vi.fn(),
}));

import { generateAndCacheAdvice } from "@/api/advice/utils";
import { getAdvice } from "@/utils/cache";

describe("advice routes", () => {
  const mockEnv = {
    BABY_DOB: "2024-01-15",
    TRMNL_CACHE_KV: {} as KVNamespace,
  } as Env;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /", () => {
    it("returns cached advice when available", async () => {
      const cachedAdvice = {
        date: "2024-06-15T10:00:00.000Z",
        summary: "Cached advice",
        age: "5 months old",
      };
      vi.mocked(getAdvice).mockResolvedValue(cachedAdvice);

      const res = await advice.request("/", {}, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(cachedAdvice);
    });

    it("returns 404 when no advice is cached", async () => {
      vi.mocked(getAdvice).mockResolvedValue(null);

      const res = await advice.request("/", {}, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: "No advice available" });
    });

    it("calls getAdvice with the KV namespace", async () => {
      vi.mocked(getAdvice).mockResolvedValue(null);

      await advice.request("/", {}, mockEnv);

      expect(getAdvice).toHaveBeenCalledWith(mockEnv.TRMNL_CACHE_KV);
    });
  });

  describe("GET /refresh", () => {
    it("generates and returns new advice", async () => {
      const newAdvice = {
        date: "2024-06-15T10:00:00.000Z",
        summary: "Fresh advice",
        age: "5 months old",
      };
      vi.mocked(generateAndCacheAdvice).mockResolvedValue(newAdvice);

      const res = await advice.request("/refresh", {}, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(newAdvice);
    });

    it("calls generateAndCacheAdvice with env", async () => {
      vi.mocked(generateAndCacheAdvice).mockResolvedValue({
        date: "2024-06-15T10:00:00.000Z",
        summary: "Fresh advice",
        age: "5 months old",
      });

      await advice.request("/refresh", {}, mockEnv);

      expect(generateAndCacheAdvice).toHaveBeenCalledWith(mockEnv);
    });
  });
});
