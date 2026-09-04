/** biome-ignore-all lint/performance/useTopLevelRegex: unit testing */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/wishes", () => ({
  submitWishFn: vi.fn(),
}));

import { submitWishFn } from "@/server/wishes";
import { SignBook } from "./signbook";

const mockSubmitWish = vi.mocked(submitWishFn);

async function openAndFillForm() {
  render(<SignBook />);
  fireEvent.click(screen.getByRole("button", { name: /share your wishes/i }));

  fireEvent.change(await screen.findByLabelText(/your name/i), {
    target: { value: "Test Person" },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/your message/i), {
    target: { value: "Congratulations!" },
  });
}

describe("SignBook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("thanks the sender after a successful submission", async () => {
    mockSubmitWish.mockResolvedValueOnce({
      success: true,
      message: "Thank you for your wishes!",
    });

    await openAndFillForm();
    fireEvent.click(screen.getByRole("button", { name: /send wishes/i }));

    expect(
      await screen.findByText(/thank you for your wishes/i)
    ).toBeInTheDocument();

    const formData = mockSubmitWish.mock.calls[0]?.[0]?.data;
    expect(formData?.get("name")).toBe("Test Person");
    expect(formData?.get("message")).toBe("Congratulations!");
  });

  it("shows the server's message when the wish is rejected", async () => {
    mockSubmitWish.mockResolvedValueOnce({
      success: false,
      message: "Please fill in your name, email, and message",
    });

    await openAndFillForm();
    fireEvent.click(screen.getByRole("button", { name: /send wishes/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please fill in your name, email, and message"
    );
    expect(screen.getByRole("button", { name: /send wishes/i })).toBeEnabled();
    // The typed fields survive a rejected submission.
    expect(screen.getByLabelText(/your name/i)).toHaveValue("Test Person");
    expect(screen.getByLabelText(/your message/i)).toHaveValue(
      "Congratulations!"
    );
  });

  it("shows a generic error when the request fails", async () => {
    mockSubmitWish.mockRejectedValueOnce(new Error("network"));

    await openAndFillForm();
    fireEvent.click(screen.getByRole("button", { name: /send wishes/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again."
    );
  });
});
