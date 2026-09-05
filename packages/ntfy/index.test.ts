import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publish } from "./index";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockResolvedValue(new Response());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("publish", () => {
  it("sends a POST request to the default ntfy URL", async () => {
    await publish({ topic: "test", message: "hello" });

    expect(mockFetch).toHaveBeenCalledWith("https://ntfy.sh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "test",
        title: undefined,
        message: "hello",
        priority: undefined,
        tags: undefined,
      }),
    });
  });

  it("sends to a custom base URL when provided", async () => {
    await publish(
      { topic: "test", message: "hello" },
      { baseUrl: "https://ntfy.example.com" }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "https://ntfy.example.com",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("includes all optional fields in the request body", async () => {
    await publish({
      topic: "alerts",
      title: "Alert",
      message: "Something happened",
      priority: 5,
      tags: ["warning", "skull"],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body).toEqual({
      topic: "alerts",
      title: "Alert",
      message: "Something happened",
      priority: 5,
      tags: ["warning", "skull"],
    });
  });

  it("returns the fetch Response", async () => {
    const expected = new Response("ok", { status: 200 });
    mockFetch.mockResolvedValue(expected);

    const result = await publish({ topic: "test", message: "hi" });

    expect(result).toBe(expected);
  });

  it("propagates fetch errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    await expect(publish({ topic: "test", message: "hi" })).rejects.toThrow(
      "Network error"
    );
  });
});
