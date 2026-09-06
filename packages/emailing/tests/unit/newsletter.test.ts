import { beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeContact } from "@/newsletter";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    contacts: {
      create: vi.fn(),
    },
  })),
}));

import { Resend } from "resend";

const mockCreate = vi.fn();

// The SDK resolves with `{ data, error }` and only throws when it cannot
// build a request at all. The mocks below mirror those shapes; the contract
// test checks them against the real API.
const created = { data: { id: "contact_123" }, error: null, headers: {} };
const alreadyExists = {
  data: null,
  error: {
    statusCode: 409,
    name: "validation_error",
    message: "Contact already exists",
  },
  headers: {},
};
const serverError = {
  data: null,
  error: {
    statusCode: 500,
    name: "application_error",
    message: "Internal server error.",
  },
  headers: {},
};

describe("subscribeContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Resend as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      contacts: { create: mockCreate },
    }));
  });

  it("returns success when contact is created", async () => {
    mockCreate.mockResolvedValueOnce(created);

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
    mockCreate.mockResolvedValueOnce(alreadyExists);

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

  it("returns error when the API answers with an error", async () => {
    mockCreate.mockResolvedValueOnce(serverError);

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

  it("returns error when the SDK throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Missing API key"));

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
    mockCreate.mockResolvedValueOnce(created);

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
