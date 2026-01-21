import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RelativeTime } from "./relative-time";

describe("RelativeTime", () => {
  const NOW = new Date("2024-06-15T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders '1 minute ago' for very recent dates", () => {
    const date = new Date(NOW.getTime() - 30 * 1000); // 30 seconds ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("1 minute ago")).toBeInTheDocument();
  });

  it("renders minutes ago", () => {
    const date = new Date(NOW.getTime() - 5 * 60 * 1000); // 5 minutes ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
  });

  it("renders 'about 1 hour ago'", () => {
    const date = new Date(NOW.getTime() - 60 * 60 * 1000); // 1 hour ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("about 1 hour ago")).toBeInTheDocument();
  });

  it("renders hours ago", () => {
    const date = new Date(NOW.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("about 3 hours ago")).toBeInTheDocument();
  });

  it("renders '1 day ago'", () => {
    const date = new Date(NOW.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("1 day ago")).toBeInTheDocument();
  });

  it("renders days ago", () => {
    const date = new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("5 days ago")).toBeInTheDocument();
  });

  it("renders 'about 1 month ago' for ~30 days", () => {
    const date = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("about 1 month ago")).toBeInTheDocument();
  });

  it("handles the edge case of 28-29 days correctly (not '0 months ago')", () => {
    const date = new Date(NOW.getTime() - 29 * 24 * 60 * 60 * 1000); // 29 days ago
    render(<RelativeTime date={date} />);
    const text = screen.getByText("29 days ago");
    expect(text).toBeInTheDocument();
  });

  it("renders months ago", () => {
    const date = new Date(NOW.getTime() - 90 * 24 * 60 * 60 * 1000); // ~3 months ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("3 months ago")).toBeInTheDocument();
  });

  it("renders '12 months ago' for ~1 year", () => {
    const date = new Date(NOW.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("12 months ago")).toBeInTheDocument();
  });

  it("renders years ago", () => {
    const date = new Date(NOW.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
    render(<RelativeTime date={date} />);
    expect(screen.getByText("almost 2 years ago")).toBeInTheDocument();
  });

  it("accepts a string date", () => {
    const date = new Date(NOW.getTime() - 5 * 60 * 1000).toISOString();
    render(<RelativeTime date={date} />);
    expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
  });

  it("accepts a timestamp number", () => {
    const timestamp = NOW.getTime() - 5 * 60 * 1000;
    render(<RelativeTime date={timestamp} />);
    expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const date = new Date(NOW.getTime() - 5 * 60 * 1000);
    render(<RelativeTime className="custom-class" date={date} />);
    const innerSpan = screen.getByText("5 minutes ago");
    expect(innerSpan).toHaveClass("custom-class");
  });
});
