import { beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeContact } from "@/newsletter";

vi.mock("resend", () => ({
  Resend: vi.fn(),
}));

import { Resend } from "resend";

const mockCreate = vi.fn();
const mockAddToSegment = vi.fn();

// The SDK resolves with `{ data, error }` and only throws when it cannot
// build a request at all. The mocks below mirror those shapes; the contract
// test checks them against the real API.
const created = {
  data: { object: "contact", id: "contact_123" },
  error: null,
  headers: {},
};
const alreadyExists = {
  data: null,
  error: {
    statusCode: 409,
    name: "validation_error",
    message: "Contact already exists",
  },
  headers: {},
};
const addedToSegment = {
  data: { id: "contact_123" },
  error: null,
  headers: {},
};
const alreadyInSegment = {
  data: null,
  error: {
    statusCode: 409,
    name: "validation_error",
    message: "Contact is already in this segment",
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

const options = {
  email: "test@example.com",
  segmentId: "seg_123",
  apiKey: "re_123",
};

describe("subscribeContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Resend).mockImplementation(
      () =>
        ({
          contacts: { create: mockCreate, segments: { add: mockAddToSegment } },
        }) as unknown as Resend
    );
  });

  it("creates the contact in the segment", async () => {
    mockCreate.mockResolvedValueOnce(created);

    const result = await subscribeContact(options);

    expect(result).toEqual({
      success: true,
      message: "Thanks for subscribing!",
    });
    expect(mockCreate).toHaveBeenCalledWith({
      email: "test@example.com",
      unsubscribed: false,
      segments: [{ id: "seg_123" }],
    });
    expect(mockAddToSegment).not.toHaveBeenCalled();
  });

  it("adds an existing contact to the segment", async () => {
    mockCreate.mockResolvedValueOnce(alreadyExists);
    mockAddToSegment.mockResolvedValueOnce(addedToSegment);

    const result = await subscribeContact(options);

    expect(result).toEqual({
      success: true,
      message: "Thanks for subscribing!",
    });
    expect(mockAddToSegment).toHaveBeenCalledWith({
      email: "test@example.com",
      segmentId: "seg_123",
    });
  });

  it("returns success when the contact is already in the segment", async () => {
    mockCreate.mockResolvedValueOnce(alreadyExists);
    mockAddToSegment.mockResolvedValueOnce(alreadyInSegment);

    const result = await subscribeContact(options);

    expect(result.success).toBe(true);
  });

  it("returns error when creation answers with an error", async () => {
    mockCreate.mockResolvedValueOnce(serverError);

    const result = await subscribeContact(options);

    expect(result).toEqual({
      success: false,
      message: "Something went wrong. Please try again.",
    });
    expect(mockAddToSegment).not.toHaveBeenCalled();
  });

  it("returns error when adding to the segment answers with an error", async () => {
    mockCreate.mockResolvedValueOnce(alreadyExists);
    mockAddToSegment.mockResolvedValueOnce(serverError);

    const result = await subscribeContact(options);

    expect(result.success).toBe(false);
  });

  it("returns error when the SDK throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Missing API key"));

    const result = await subscribeContact(options);

    expect(result).toEqual({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  });
});
