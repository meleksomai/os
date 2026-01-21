import { describe, expect, it } from "vitest";

import {
  formatPublishedAt,
  formatPublishedAtWithRelative,
  parsePublishedAt,
} from "./date";

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

describe("formatPublishedAtWithRelative", () => {
  it("shows '1 day ago' for 1 day difference", () => {
    const date = parsePublishedAt("2024-06-01");
    const now = parsePublishedAt("2024-06-02");
    expect(formatPublishedAtWithRelative(date, now)).toBe(
      "June 1, 2024 (1 day ago)"
    );
  });

  it("shows days ago for multiple days", () => {
    const date = parsePublishedAt("2024-06-01");
    const now = parsePublishedAt("2024-06-06");
    expect(formatPublishedAtWithRelative(date, now)).toBe(
      "June 1, 2024 (5 days ago)"
    );
  });

  it("shows 'about 1 month ago' for ~30 days", () => {
    const date = parsePublishedAt("2024-06-01");
    const now = parsePublishedAt("2024-07-01");
    expect(formatPublishedAtWithRelative(date, now)).toBe(
      "June 1, 2024 (about 1 month ago)"
    );
  });

  it("handles edge case of 29 days correctly (not '0 months ago')", () => {
    const date = parsePublishedAt("2024-06-01");
    const now = parsePublishedAt("2024-06-30");
    const result = formatPublishedAtWithRelative(date, now);
    expect(result).not.toContain("0 months");
    expect(result).toBe("June 1, 2024 (29 days ago)");
  });

  it("shows months ago", () => {
    const date = parsePublishedAt("2024-01-01");
    const now = parsePublishedAt("2024-04-01");
    expect(formatPublishedAtWithRelative(date, now)).toBe(
      "January 1, 2024 (3 months ago)"
    );
  });

  it("shows 'about 1 year ago' for ~1 year", () => {
    const date = parsePublishedAt("2023-06-01");
    const now = parsePublishedAt("2024-06-01");
    expect(formatPublishedAtWithRelative(date, now)).toBe(
      "June 1, 2023 (about 1 year ago)"
    );
  });

  it("shows years ago for multiple years", () => {
    const date = parsePublishedAt("2022-06-01");
    const now = parsePublishedAt("2024-06-01");
    expect(formatPublishedAtWithRelative(date, now)).toBe(
      "June 1, 2022 (about 2 years ago)"
    );
  });
});
