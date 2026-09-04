import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@workspace/database", () => ({
  db: {
    wishes: {
      submit: vi.fn(),
    },
  },
}));

vi.mock("@workspace/ntfy", () => ({
  publish: vi.fn(),
}));

import { db } from "@workspace/database";
import { publish } from "@workspace/ntfy";
import { submitWish, WISH_RECEIVED } from "./wishes.server";

const mockSubmit = vi.mocked(db.wishes.submit);
const mockPublish = vi.mocked(publish);

function createFormData(data: {
  name?: string;
  email?: string;
  message?: string;
  isPublic?: boolean;
}): FormData {
  const formData = new FormData();
  if (data.name) {
    formData.set("name", data.name);
  }
  if (data.email) {
    formData.set("email", data.email);
  }
  if (data.message) {
    formData.set("message", data.message);
  }
  if (data.isPublic) {
    formData.set("isPublic", "on");
  }
  return formData;
}

const validWish = {
  name: "John Doe",
  email: "john@example.com",
  message: "Congratulations!",
};

describe("submitWish", () => {
  beforeEach(() => {
    vi.stubEnv("NTFY_WISHES_ID", "baby-wishes");
    mockSubmit.mockResolvedValue(undefined);
    mockPublish.mockResolvedValue(new Response());
  });

  it("stores the wish and notifies", async () => {
    const result = await submitWish(
      createFormData({ ...validWish, isPublic: true })
    );

    expect(result).toEqual(WISH_RECEIVED);
    expect(mockSubmit).toHaveBeenCalledWith({ ...validWish, isPublic: true });
    expect(mockPublish).toHaveBeenCalledWith({
      topic: "baby-wishes",
      title: "New wish from John Doe (john@example.com)",
      message: "Congratulations!",
      tags: ["baby", "heart"],
    });
  });

  it("stores a private wish when isPublic is not checked", async () => {
    await submitWish(createFormData(validWish));

    expect(mockSubmit).toHaveBeenCalledWith({ ...validWish, isPublic: false });
  });

  it("trims the fields and lowercases the email", async () => {
    await submitWish(
      createFormData({
        name: "  John Doe ",
        email: " John@Example.com ",
        message: " Congratulations! ",
      })
    );

    expect(mockSubmit).toHaveBeenCalledWith({ ...validWish, isPublic: false });
  });

  it("skips the notification when the topic is not configured", async () => {
    vi.stubEnv("NTFY_WISHES_ID", "");

    const result = await submitWish(createFormData(validWish));

    expect(result).toEqual(WISH_RECEIVED);
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it.each(["name", "email", "message"] as const)(
    "rejects a wish without %s",
    async (missing) => {
      const result = await submitWish(
        createFormData({ ...validWish, [missing]: undefined })
      );

      expect(result.success).toBe(false);
      expect(mockSubmit).not.toHaveBeenCalled();
      expect(mockPublish).not.toHaveBeenCalled();
    }
  );

  it("rejects a blank name", async () => {
    const result = await submitWish(
      createFormData({ ...validWish, name: "  " })
    );

    expect(result.success).toBe(false);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const result = await submitWish(
      createFormData({ ...validWish, email: "not-an-email" })
    );

    expect(result).toEqual({
      success: false,
      message: "Please enter a valid email",
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("rejects an overlong message", async () => {
    const result = await submitWish(
      createFormData({ ...validWish, message: "x".repeat(2001) })
    );

    expect(result.success).toBe(false);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("reports a failure instead of throwing when the database fails", async () => {
    mockSubmit.mockRejectedValue(new Error("Database connection failed"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await submitWish(createFormData(validWish));

    expect(result).toEqual({
      success: false,
      message: "Something went wrong. Please try again.",
    });
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it("still succeeds when the notification fails", async () => {
    mockPublish.mockRejectedValue(new Error("ntfy down"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await submitWish(createFormData(validWish));

    expect(result).toEqual(WISH_RECEIVED);
    expect(mockSubmit).toHaveBeenCalled();
  });
});
