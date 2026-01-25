import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prompt } from "./prompt";

describe("prompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("includes the child's age in the prompt", () => {
    vi.setSystemTime(new Date("2024-06-15"));

    const age = {
      years: 0,
      months: 3,
      days: 0,
      totalMonths: 3,
      description: "3 months old",
      dob: "2024-03-15",
    };

    const result = prompt(age);

    expect(result).toContain("3 months old");
  });

  it("includes a topic in the prompt", () => {
    vi.setSystemTime(new Date("2024-01-01"));

    const age = {
      years: 1,
      months: 0,
      days: 0,
      totalMonths: 12,
      description: "12 months old",
      dob: "2023-01-01",
    };

    const result = prompt(age);

    // Should contain one of the topics (in quotes)
    // biome-ignore lint/performance/useTopLevelRegex: test regex usage
    expect(result).toMatch(/"[\w\s]+"/);
  });

  it("includes word limit instruction", () => {
    vi.setSystemTime(new Date("2024-01-01"));

    const age = {
      years: 0,
      months: 6,
      days: 0,
      totalMonths: 6,
      description: "6 months old",
      dob: "2023-07-01",
    };

    const result = prompt(age);

    expect(result).toContain("Maximum 50 words");
  });

  it("returns same topic for same day", () => {
    vi.setSystemTime(new Date("2024-06-15T08:00:00Z"));

    const age = {
      years: 0,
      months: 1,
      days: 0,
      totalMonths: 1,
      description: "1 month old",
      dob: "2024-05-15",
    };

    const result1 = prompt(age);

    vi.setSystemTime(new Date("2024-06-15T20:00:00Z"));
    const result2 = prompt(age);

    expect(result1).toBe(result2);
  });

  it("returns different topic for different days", () => {
    const age = {
      years: 0,
      months: 1,
      days: 0,
      totalMonths: 1,
      description: "1 month old",
      dob: "2024-05-15",
    };

    vi.setSystemTime(new Date("2024-06-15"));
    const result1 = prompt(age);

    vi.setSystemTime(new Date("2024-06-16"));
    const result2 = prompt(age);

    expect(result1).not.toBe(result2);
  });

  it("cycles through all 15 topics over 15 days", () => {
    const age = {
      years: 0,
      months: 1,
      days: 0,
      totalMonths: 1,
      description: "1 month old",
      dob: "2024-05-15",
    };

    const topics = new Set<string>();

    // Collect topics over 30 consecutive days to ensure full coverage
    for (let i = 1; i <= 30; i++) {
      vi.setSystemTime(
        new Date(`2024-03-${String(i).padStart(2, "0")}T12:00:00Z`)
      );
      const result = prompt(age);
      // biome-ignore lint/performance/useTopLevelRegex: test regex usage
      const match = result.match(/"([^"]+)"/);
      if (match?.[1]) {
        topics.add(match[1]);
      }
    }

    // Should have all 15 unique topics
    expect(topics.size).toBe(15);
  });
});
