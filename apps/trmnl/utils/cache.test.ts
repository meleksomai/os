import { describe, expect, it, vi } from "vitest";
import {
  type Advice,
  AdviceSchema,
  CACHE_KEYS,
  getAdvice,
  ONE_DAY,
  setAdvice,
} from "./cache";

const createMockKV = () => ({
  get: vi.fn(),
  put: vi.fn(),
});

describe("cache", () => {
  describe("CACHE_KEYS", () => {
    it("has correct LATEST key", () => {
      expect(CACHE_KEYS.LATEST).toBe("advice-latest");
    });

    it("generates correct byAge key", () => {
      expect(CACHE_KEYS.byAge("3 months old")).toBe("advice-3 months old");
      expect(CACHE_KEYS.byAge("1 year old")).toBe("advice-1 year old");
    });
  });

  describe("AdviceSchema", () => {
    it("validates correct advice object", () => {
      const advice = {
        date: "2024-01-15T10:30:00.000Z",
        summary: "Some parenting advice",
        age: "3 months old",
      };

      const result = AdviceSchema.safeParse(advice);
      expect(result.success).toBe(true);
    });

    it("rejects missing fields", () => {
      const incomplete = { date: "2024-01-15" };
      const result = AdviceSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it("rejects wrong types", () => {
      const wrongTypes = { date: 123, summary: true, age: null };
      const result = AdviceSchema.safeParse(wrongTypes);
      expect(result.success).toBe(false);
    });
  });

  describe("getAdvice", () => {
    it("returns null when key does not exist", async () => {
      const mockKV = createMockKV();
      mockKV.get.mockResolvedValue(null);

      const result = await getAdvice(mockKV as unknown as KVNamespace);

      expect(result).toBeNull();
      expect(mockKV.get).toHaveBeenCalledWith(CACHE_KEYS.LATEST);
    });

    it("returns validated advice when data exists", async () => {
      const mockKV = createMockKV();
      const advice: Advice = {
        date: "2024-01-15T10:30:00.000Z",
        summary: "Test advice",
        age: "3 months old",
      };
      mockKV.get.mockResolvedValue(JSON.stringify(advice));

      const result = await getAdvice(mockKV as unknown as KVNamespace);

      expect(result).toEqual(advice);
    });

    it("returns null when data fails validation", async () => {
      const mockKV = createMockKV();
      const invalidData = { foo: "bar" };
      mockKV.get.mockResolvedValue(JSON.stringify(invalidData));

      const result = await getAdvice(mockKV as unknown as KVNamespace);

      expect(result).toBeNull();
    });

    it("returns null when JSON is malformed", async () => {
      const mockKV = createMockKV();
      mockKV.get.mockResolvedValue("not valid json {");

      await expect(
        getAdvice(mockKV as unknown as KVNamespace)
      ).rejects.toThrow();
    });
  });

  describe("setAdvice", () => {
    it("stores advice with both archive and latest keys", async () => {
      const mockKV = createMockKV();
      mockKV.put.mockResolvedValue(undefined);

      const advice: Advice = {
        date: "2024-01-15T10:30:00.000Z",
        summary: "Test advice",
        age: "3 months old",
      };

      await setAdvice(mockKV as unknown as KVNamespace, advice, "3 months old");

      expect(mockKV.put).toHaveBeenCalledTimes(2);
    });

    it("stores archive without TTL", async () => {
      const mockKV = createMockKV();
      mockKV.put.mockResolvedValue(undefined);

      const advice: Advice = {
        date: "2024-01-15T10:30:00.000Z",
        summary: "Test advice",
        age: "3 months old",
      };

      await setAdvice(mockKV as unknown as KVNamespace, advice, "3 months old");

      expect(mockKV.put).toHaveBeenCalledWith(
        "advice-3 months old",
        JSON.stringify(advice)
      );
    });

    it("stores latest with 1 day TTL", async () => {
      const mockKV = createMockKV();
      mockKV.put.mockResolvedValue(undefined);

      const advice: Advice = {
        date: "2024-01-15T10:30:00.000Z",
        summary: "Test advice",
        age: "3 months old",
      };

      await setAdvice(mockKV as unknown as KVNamespace, advice, "3 months old");

      expect(mockKV.put).toHaveBeenCalledWith(
        CACHE_KEYS.LATEST,
        JSON.stringify(advice),
        { expirationTtl: ONE_DAY }
      );
    });
  });

  describe("ONE_DAY constant", () => {
    it("equals 86400 seconds", () => {
      expect(ONE_DAY).toBe(86400);
    });
  });
});
