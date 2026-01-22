import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicWish, Wish } from "./schema";

const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: mockSelect,
}));

vi.mock("../lib/client", () => ({
  getSupabaseClient: () => ({
    from: mockFrom,
  }),
}));

// Import after mocking
const { wishes } = await import("./wishes");

describe("wishes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset chain mocks
    mockSelect.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
    });
    mockOrder.mockResolvedValue({ data: [], error: null });
    // Chain eq calls: first eq returns object with eq and order
    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    });
  });

  describe("submit", () => {
    it("inserts a wish with reviewed=null", async () => {
      mockInsert.mockResolvedValue({ error: null });

      await wishes.submit({
        name: "John Doe",
        email: "john@example.com",
        message: "Congratulations!",
        isPublic: true,
      });

      expect(mockFrom).toHaveBeenCalledWith("wishes");
      expect(mockInsert).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        message: "Congratulations!",
        is_public: true,
        reviewed: null,
      });
    });

    it("throws an error when insert fails", async () => {
      mockInsert.mockResolvedValue({
        error: { message: "Database error" },
      });

      await expect(
        wishes.submit({
          name: "John Doe",
          email: "john@example.com",
          message: "Congratulations!",
          isPublic: false,
        })
      ).rejects.toThrow("Failed to submit wish: Database error");
    });
  });

  describe("read", () => {
    it("returns all wishes ordered by created_at desc", async () => {
      const mockWishes: Wish[] = [
        {
          id: "1",
          name: "John",
          email: "john@example.com",
          message: "Hello",
          is_public: true,
          reviewed: true,
          created_at: "2026-01-22T10:00:00Z",
        },
        {
          id: "2",
          name: "Jane",
          email: "jane@example.com",
          message: "Hi",
          is_public: false,
          reviewed: null,
          created_at: "2026-01-21T10:00:00Z",
        },
      ];

      mockOrder.mockResolvedValue({ data: mockWishes, error: null });

      const result = await wishes.read();

      expect(mockFrom).toHaveBeenCalledWith("wishes");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockWishes);
    });

    it("returns empty array when no wishes exist", async () => {
      mockOrder.mockResolvedValue({ data: null, error: null });

      const result = await wishes.read();

      expect(result).toEqual([]);
    });

    it("throws an error when read fails", async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(wishes.read()).rejects.toThrow(
        "Failed to read wishes: Database error"
      );
    });
  });

  describe("readPublic", () => {
    it("returns only public and reviewed wishes without email", async () => {
      const mockWishes: PublicWish[] = [
        {
          id: "1",
          name: "John",
          message: "Hello",
          created_at: "2026-01-22T10:00:00Z",
        },
      ];

      mockOrder.mockResolvedValue({ data: mockWishes, error: null });

      const result = await wishes.readPublic();

      expect(mockFrom).toHaveBeenCalledWith("wishes");
      expect(mockSelect).toHaveBeenCalledWith("id, name, message, created_at");
      expect(mockEq).toHaveBeenCalledWith("is_public", true);
      expect(mockEq).toHaveBeenCalledWith("reviewed", true);
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockWishes);
    });

    it("throws an error when read fails", async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(wishes.readPublic()).rejects.toThrow(
        "Failed to read public wishes: Database error"
      );
    });
  });
});
