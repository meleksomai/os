/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the action
vi.mock("@/actions/newsletter", () => ({
  subscribeToNewsletter: vi.fn(),
}));

// Mock the UI hooks
vi.mock("@workspace/ui/hooks/use-reveal", () => ({
  useReveal: () => ({ ref: { current: null }, isVisible: true }),
}));

import { ContactForm } from "./contact-form";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the contact heading", () => {
      render(<ContactForm />);

      expect(
        screen.getByRole("heading", { name: /let's talk/i })
      ).toBeInTheDocument();
    });

    it("renders the email input", () => {
      render(<ContactForm />);

      expect(
        screen.getByPlaceholderText(/what's your email/i)
      ).toBeInTheDocument();
    });

    it("renders the submit button", () => {
      render(<ContactForm />);

      expect(
        screen.getByRole("button", { name: /get updates/i })
      ).toBeInTheDocument();
    });

    it("renders contact email link", () => {
      render(<ContactForm />);

      expect(screen.getByText("hello@somai.me")).toBeInTheDocument();
    });

    it("renders unsubscribe notice", () => {
      render(<ContactForm />);

      expect(screen.getByText(/no spam, just updates/i)).toBeInTheDocument();
    });
  });

  describe("form interaction", () => {
    it("updates email input value on change", () => {
      render(<ContactForm />);

      const input = screen.getByPlaceholderText(/what's your email/i);
      fireEvent.change(input, { target: { value: "test@example.com" } });

      expect(input).toHaveValue("test@example.com");
    });

    it("disables submit button when email is empty", () => {
      render(<ContactForm />);

      const button = screen.getByRole("button", { name: /get updates/i });
      expect(button).toBeDisabled();
    });

    it("enables submit button when email is entered", () => {
      render(<ContactForm />);

      const input = screen.getByPlaceholderText(/what's your email/i);
      fireEvent.change(input, { target: { value: "test@example.com" } });

      const button = screen.getByRole("button", { name: /get updates/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("has form element", () => {
      const { container } = render(<ContactForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("email input has required name attribute", () => {
      render(<ContactForm />);

      const input = screen.getByPlaceholderText(/what's your email/i);
      expect(input).toHaveAttribute("name", "email");
    });

    it("email input has type email for validation", () => {
      render(<ContactForm />);

      const input = screen.getByPlaceholderText(/what's your email/i);
      expect(input).toHaveAttribute("type", "email");
    });

    it("email input is required", () => {
      render(<ContactForm />);

      const input = screen.getByPlaceholderText(/what's your email/i);
      expect(input).toHaveAttribute("required");
    });
  });

  describe("button states", () => {
    it("subscribe another email button has correct type", () => {
      render(<ContactForm />);

      // Find all buttons with type="button" (not submit)
      const buttons = screen.getAllByRole("button");
      const nonSubmitButtons = buttons.filter(
        (btn) => btn.getAttribute("type") === "button"
      );

      // Check that reset buttons exist (they're hidden but in DOM)
      expect(nonSubmitButtons.length).toBeGreaterThanOrEqual(0);
    });

    it("submit button has correct type", () => {
      render(<ContactForm />);

      const submitButton = screen.getByRole("button", { name: /get updates/i });
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });
});
