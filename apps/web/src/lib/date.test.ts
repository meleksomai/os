import { describe, expect, it } from "vitest";

import { formatPublishedAt, parsePublishedAt } from "./date";

describe("parsePublishedAt", () => {
  it("parses ISO YYYY-MM-DD as UTC midnight", () => {
    const date = parsePublishedAt("2024-06-01");
    expect(date.toISOString()).toBe("2024-06-01T00:00:00.000Z");
  });

  it("rejects ambiguous dates", () => {
    expect(() => parsePublishedAt("06-01-2024")).toThrow();
  });

  it("rejects invalid dates", () => {
    expect(() => parsePublishedAt("not-a-date")).toThrow();
  });
});

describe("formatPublishedAt", () => {
  it("formats deterministically in UTC", () => {
    const date = parsePublishedAt("2024-06-01");
    expect(formatPublishedAt(date)).toBe("June 1, 2024");
  });
});
