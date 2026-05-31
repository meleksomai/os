import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NTFY_WISHES_ID = "baby-wishes";
});

vi.mock("@workspace/flags", () => ({
  enableShareWishes: vi.fn(),
}));

vi.mock("@workspace/database", () => ({
  db: {
    wishes: {
      submit: vi.fn(),
      readPublic: vi.fn(),
    },
  },
}));

vi.mock("@workspace/ntfy", () => ({
  publish: vi.fn(),
}));

import { db } from "@workspace/database";
import { enableShareWishes } from "@workspace/flags";
import { publish } from "@workspace/ntfy";
import { getPublicWishes, submitWish } from "./wishes";

const mockSubmit = vi.mocked(db.wishes.submit);
const mockReadPublic = vi.mocked(db.wishes.readPublic);
const mockEnableShareWishes = vi.mocked(enableShareWishes);
const mockPublish = vi.mocked(publish);

function createFormData(data: {
  name?: string;
  email?: string;
  message?: string;
  isPublic?: boolean;
}): FormData {
  const formData = new FormData();
  if (data.name) formData.set("name", data.name);
  if (data.email) formData.set("email", data.email);
  if (data.message) formData.set("message", data.message);
  if (data.isPublic) formData.set("isPublic", "on");
  return formData;
}

describe("wishes actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnableShareWishes.mockResolvedValue(true);
    mockPublish.mockResolvedValue(new Response());
  });

  describe("submitWish", () => {
    it("submits a wish with correct data", async () => {
      mockSubmit.mockResolvedValue(undefined);

      await submitWish(
        createFormData({
          name: "John Doe",
          email: "john@example.com",
          message: "Congratulations!",
          isPublic: true,
        })
      );

      expect(mockSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        message: "Congratulations!",
        isPublic: true,
      });
      expect(mockPublish).toHaveBeenCalledWith({
        topic: "baby-wishes",
        title: "New wish from John Doe (john@example.com)",
        message: "Congratulations!",
        tags: ["baby", "heart"],
      });
    });

    it("submits a private wish when isPublic is not checked", async () => {
      mockSubmit.mockResolvedValue(undefined);

      await submitWish(
        createFormData({
          name: "Jane Doe",
          email: "jane@example.com",
          message: "Best wishes!",
          isPublic: false,
        })
      );

      expect(mockSubmit).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Best wishes!",
        isPublic: false,
      });
    });

    it("throws error when name is missing", async () => {
      await expect(
        submitWish(
          createFormData({
            email: "john@example.com",
            message: "Hello",
          })
        )
      ).rejects.toThrow("Missing required fields");

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(mockPublish).not.toHaveBeenCalled();
    });

    it("throws error when email is missing", async () => {
      await expect(
        submitWish(
          createFormData({
            name: "John Doe",
            message: "Hello",
          })
        )
      ).rejects.toThrow("Missing required fields");

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(mockPublish).not.toHaveBeenCalled();
    });

    it("throws error when message is missing", async () => {
      await expect(
        submitWish(
          createFormData({
            name: "John Doe",
            email: "john@example.com",
          })
        )
      ).rejects.toThrow("Missing required fields");

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(mockPublish).not.toHaveBeenCalled();
    });

    it("propagates database errors", async () => {
      mockSubmit.mockRejectedValue(new Error("Database connection failed"));

      await expect(
        submitWish(
          createFormData({
            name: "John Doe",
            email: "john@example.com",
            message: "Hello",
          })
        )
      ).rejects.toThrow("Database connection failed");
    });

    it("returns without submitting when share wishes disabled", async () => {
      mockEnableShareWishes.mockResolvedValue(false);

      await submitWish(
        createFormData({
          name: "John Doe",
          email: "john@example.com",
          message: "Hello",
          isPublic: true,
        })
      );

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(mockPublish).not.toHaveBeenCalled();
    });
  });

  describe("getPublicWishes", () => {
    it("returns public wishes without email from database", async () => {
      const mockWishes = [
        {
          id: "1",
          name: "John",
          message: "Congratulations!",
          created_at: "2026-01-22T10:00:00Z",
        },
        {
          id: "2",
          name: "Jane",
          message: "Best wishes!",
          created_at: "2026-01-21T10:00:00Z",
        },
      ];

      mockReadPublic.mockResolvedValue(mockWishes);

      const result = await getPublicWishes();

      expect(mockReadPublic).toHaveBeenCalled();
      expect(result).toEqual(mockWishes);
      // Verify no email in response
      for (const wish of result) {
        expect(wish).not.toHaveProperty("email");
      }
    });

    it("returns empty array when no public wishes exist", async () => {
      mockReadPublic.mockResolvedValue([]);

      const result = await getPublicWishes();

      expect(result).toEqual([]);
    });

    it("propagates database errors", async () => {
      mockReadPublic.mockRejectedValue(new Error("Database error"));

      await expect(getPublicWishes()).rejects.toThrow("Database error");
    });

    it("returns empty array when share wishes disabled", async () => {
      mockEnableShareWishes.mockResolvedValue(false);

      const result = await getPublicWishes();

      expect(result).toEqual([]);
      expect(mockReadPublic).not.toHaveBeenCalled();
    });
  });
});
