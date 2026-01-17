import { beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeContact } from "./subscription";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    contacts: {
      create: vi.fn(),
    },
  })),
}));

import { Resend } from "resend";

const mockCreate = vi.fn();

describe("subscribeContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Resend as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      contacts: { create: mockCreate },
    }));
  });

  it("returns success when contact is created", async () => {
    mockCreate.mockResolvedValueOnce({ id: "contact_123" });

    const result = await subscribeContact({
      email: "test@example.com",
      audienceId: "aud_123",
      apiKey: "re_123",
    });

    expect(result).toEqual({
      success: true,
      message: "Thanks for subscribing!",
    });
  });

  it("returns success when contact already exists", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Contact already exists"));

    const result = await subscribeContact({
      email: "existing@example.com",
      audienceId: "aud_123",
      apiKey: "re_123",
    });

    expect(result).toEqual({
      success: true,
      message: "Thanks for subscribing!",
    });
  });

  it("returns error when API fails", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Network error"));

    const result = await subscribeContact({
      email: "test@example.com",
      audienceId: "aud_123",
      apiKey: "re_123",
    });

    expect(result).toEqual({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  });

  it("calls Resend with correct parameters", async () => {
    mockCreate.mockResolvedValueOnce({ id: "contact_123" });

    await subscribeContact({
      email: "test@example.com",
      audienceId: "aud_123",
      apiKey: "re_123",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      email: "test@example.com",
      unsubscribed: false,
      audienceId: "aud_123",
    });
  });
});
