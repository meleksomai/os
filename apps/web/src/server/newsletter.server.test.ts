import { beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeToNewsletter } from "./newsletter.server";

vi.mock("@workspace/emailing/newsletter", () => ({
  subscribeContact: vi.fn(),
}));

import { subscribeContact } from "@workspace/emailing/newsletter";

const mockSubscribeContact = vi.mocked(subscribeContact);

function createFormData(email: string): FormData {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

describe("subscribeToNewsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RESEND_API_KEY", "test_api_key");
    vi.stubEnv("RESEND_SEGMENT_GENERAL", "test_audience_id");
  });

  describe("validation", () => {
    it("returns error when email is missing", async () => {
      const formData = new FormData();

      const result = await subscribeToNewsletter(formData);

      expect(result).toEqual({
        success: false,
        message: "Please enter a valid email",
      });
      expect(mockSubscribeContact).not.toHaveBeenCalled();
    });

    it("returns error when email is empty", async () => {
      const result = await subscribeToNewsletter(createFormData("   "));

      expect(result).toEqual({
        success: false,
        message: "Please enter a valid email",
      });
      expect(mockSubscribeContact).not.toHaveBeenCalled();
    });

    it("returns error when email format is invalid", async () => {
      const result = await subscribeToNewsletter(
        createFormData("invalid-email")
      );

      expect(result).toEqual({
        success: false,
        message: "Please enter a valid email",
      });
      expect(mockSubscribeContact).not.toHaveBeenCalled();
    });

    it("returns error when email exceeds max length", async () => {
      const longEmail = `${"a".repeat(250)}@test.com`;

      const result = await subscribeToNewsletter(createFormData(longEmail));

      expect(result).toEqual({
        success: false,
        message: "Please enter a valid email",
      });
      expect(mockSubscribeContact).not.toHaveBeenCalled();
    });
  });

  describe("environment variables", () => {
    it("returns error when API key is missing", async () => {
      vi.stubEnv("RESEND_API_KEY", "");

      const result = await subscribeToNewsletter(
        createFormData("test@example.com")
      );

      expect(result).toEqual({
        success: false,
        message: "Subscription temporarily unavailable",
      });
      expect(mockSubscribeContact).not.toHaveBeenCalled();
    });

    it("returns error when audience ID is missing", async () => {
      vi.stubEnv("RESEND_SEGMENT_GENERAL", "");

      const result = await subscribeToNewsletter(
        createFormData("test@example.com")
      );

      expect(result).toEqual({
        success: false,
        message: "Subscription temporarily unavailable",
      });
      expect(mockSubscribeContact).not.toHaveBeenCalled();
    });
  });

  describe("successful subscription", () => {
    it("calls subscribeContact with correct parameters", async () => {
      mockSubscribeContact.mockResolvedValueOnce({
        success: true,
        message: "Thanks for subscribing!",
      });

      await subscribeToNewsletter(createFormData("Test@Example.COM"));

      expect(mockSubscribeContact).toHaveBeenCalledWith({
        email: "test@example.com",
        audienceId: "test_audience_id",
        apiKey: "test_api_key",
      });
    });

    it("returns success response from subscribeContact", async () => {
      mockSubscribeContact.mockResolvedValueOnce({
        success: true,
        message: "Thanks for subscribing!",
      });

      const result = await subscribeToNewsletter(
        createFormData("test@example.com")
      );

      expect(result).toEqual({
        success: true,
        message: "Thanks for subscribing!",
      });
    });

    it("trims and lowercases email", async () => {
      mockSubscribeContact.mockResolvedValueOnce({
        success: true,
        message: "Thanks for subscribing!",
      });

      await subscribeToNewsletter(createFormData("  TEST@EXAMPLE.COM  "));

      expect(mockSubscribeContact).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
        })
      );
    });
  });

  describe("error handling", () => {
    it("returns error response from subscribeContact", async () => {
      mockSubscribeContact.mockResolvedValueOnce({
        success: false,
        message: "Something went wrong. Please try again.",
      });

      const result = await subscribeToNewsletter(
        createFormData("test@example.com")
      );

      expect(result).toEqual({
        success: false,
        message: "Something went wrong. Please try again.",
      });
    });
  });
});
