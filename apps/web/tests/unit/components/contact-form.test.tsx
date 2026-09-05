/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/newsletter/functions", () => ({
  subscribeToNewsletterFn: vi.fn(),
}));

vi.mock("@workspace/ui/hooks/use-reveal", () => ({
  useReveal: () => ({ ref: { current: null }, isVisible: true }),
}));

import { ContactForm } from "@/components/contact-form";
import { subscribeToNewsletterFn } from "@/server/newsletter/functions";

const mockSubscribe = vi.mocked(subscribeToNewsletterFn);

function submitEmail(email: string) {
  fireEvent.change(screen.getByPlaceholderText(/what's your email/i), {
    target: { value: email },
  });
  fireEvent.click(screen.getByRole("button", { name: /get updates/i }));
}

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

    it("hides the result states from assistive technology until needed", () => {
      render(<ContactForm />);

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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

      expect(
        screen.getByRole("button", { name: /get updates/i })
      ).toBeDisabled();
    });

    it("enables submit button when email is entered", () => {
      render(<ContactForm />);

      fireEvent.change(screen.getByPlaceholderText(/what's your email/i), {
        target: { value: "test@example.com" },
      });

      expect(
        screen.getByRole("button", { name: /get updates/i })
      ).not.toBeDisabled();
    });

    it("email input is a required email field named email", () => {
      render(<ContactForm />);

      const input = screen.getByPlaceholderText(/what's your email/i);
      expect(input).toHaveAttribute("name", "email");
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("required");
    });
  });

  describe("submission", () => {
    it("shows the success state with the submitted email", async () => {
      mockSubscribe.mockResolvedValueOnce({
        success: true,
        message: "Thanks for subscribing!",
      });

      render(<ContactForm />);
      submitEmail("me@example.com");

      const status = await screen.findByRole("status");
      expect(status).toHaveTextContent(/you're on the list/i);
      expect(status).toHaveTextContent("me@example.com");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      const formData = mockSubscribe.mock.calls[0]?.[0]?.data;
      expect(formData?.get("email")).toBe("me@example.com");
    });

    it("lets the visitor subscribe another email after success", async () => {
      mockSubscribe.mockResolvedValueOnce({
        success: true,
        message: "Thanks for subscribing!",
      });

      render(<ContactForm />);
      submitEmail("me@example.com");
      await screen.findByRole("status");

      fireEvent.click(
        screen.getByRole("button", { name: /subscribe another email/i })
      );

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText(/what's your email/i)).toHaveValue("");
    });

    it("shows the server's message when the subscription is refused", async () => {
      mockSubscribe.mockResolvedValueOnce({
        success: false,
        message: "Subscription temporarily unavailable",
      });

      render(<ContactForm />);
      submitEmail("me@example.com");

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Something went wrong");
      expect(alert).toHaveTextContent("Subscription temporarily unavailable");
    });

    it("shows a generic error and can retry when the request fails", async () => {
      mockSubscribe.mockRejectedValueOnce(new Error("network"));

      render(<ContactForm />);
      submitEmail("me@example.com");

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(
        "Something went wrong. Please try again."
      );

      fireEvent.click(screen.getByRole("button", { name: /try again/i }));

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText(/what's your email/i)).toHaveValue("");
    });
  });
});
