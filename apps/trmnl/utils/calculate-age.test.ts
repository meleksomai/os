import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateAge } from "./calculate-age";

describe("calculateAge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates age in days for newborns under 7 days", () => {
    vi.setSystemTime(new Date("2024-03-10"));
    const result = calculateAge("2024-03-07");

    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(3);
    expect(result.totalMonths).toBe(0);
    expect(result.description).toBe("3 days old");
    expect(result.dob).toBe("2024-03-07");
  });

  it("uses singular 'day' for 1 day old", () => {
    vi.setSystemTime(new Date("2024-03-08"));
    const result = calculateAge("2024-03-07");

    expect(result.description).toBe("1 day old");
  });

  it("calculates age in weeks for babies 7-59 days old", () => {
    vi.setSystemTime(new Date("2024-03-21"));
    const result = calculateAge("2024-03-07");

    expect(result.totalMonths).toBe(0);
    expect(result.days).toBe(14);
    expect(result.description).toBe("2 weeks old");
  });

  it("uses singular 'week' for 1 week old", () => {
    vi.setSystemTime(new Date("2024-03-14"));
    const result = calculateAge("2024-03-07");

    expect(result.description).toBe("1 week old");
  });

  it("calculates age in months for children under 2 years", () => {
    vi.setSystemTime(new Date("2024-09-07"));
    const result = calculateAge("2024-03-07");

    expect(result.years).toBe(0);
    expect(result.months).toBe(6);
    expect(result.totalMonths).toBe(6);
    expect(result.description).toBe("6 months old");
  });

  it("uses singular 'month' for 1 month old", () => {
    vi.setSystemTime(new Date("2024-04-07"));
    const result = calculateAge("2024-03-07");

    expect(result.description).toBe("1 month old");
  });

  it("calculates age with years and months for children 2-5 years", () => {
    vi.setSystemTime(new Date("2027-06-07"));
    const result = calculateAge("2024-03-07");

    expect(result.years).toBe(3);
    expect(result.months).toBe(3);
    expect(result.totalMonths).toBe(39);
    expect(result.description).toBe("3 years and 3 months old");
  });

  it("shows months for 1 year 1 month old (under 24 months)", () => {
    vi.setSystemTime(new Date("2025-04-07"));
    const result = calculateAge("2024-03-07");

    expect(result.years).toBe(1);
    expect(result.months).toBe(1);
    expect(result.totalMonths).toBe(13);
    expect(result.description).toBe("13 months old");
  });

  it("uses singular forms correctly for years and months at 2+ years", () => {
    vi.setSystemTime(new Date("2026-04-07"));
    const result = calculateAge("2024-03-07");

    expect(result.years).toBe(2);
    expect(result.months).toBe(1);
    expect(result.description).toBe("2 years and 1 month old");
  });

  it("calculates age in years only for children 5+ years", () => {
    vi.setSystemTime(new Date("2030-06-15"));
    const result = calculateAge("2024-03-07");

    expect(result.years).toBe(6);
    expect(result.description).toBe("6 years old");
  });

  it("shows only years for 2-5 year olds when months is 0", () => {
    vi.setSystemTime(new Date("2027-03-07"));
    const result = calculateAge("2024-03-07");

    expect(result.years).toBe(3);
    expect(result.months).toBe(0);
    expect(result.description).toBe("3 years old");
  });

  it("handles day adjustment when current day is less than birth day", () => {
    vi.setSystemTime(new Date("2024-04-05"));
    const result = calculateAge("2024-03-10");

    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(26);
  });

  it("handles month adjustment when current month is less than birth month", () => {
    vi.setSystemTime(new Date("2025-02-07"));
    const result = calculateAge("2024-05-07");

    expect(result.years).toBe(0);
    expect(result.months).toBe(9);
    expect(result.totalMonths).toBe(9);
  });

  it("handles year boundary correctly", () => {
    vi.setSystemTime(new Date("2025-01-15"));
    const result = calculateAge("2024-12-20");

    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(26);
  });

  it("handles leap year dates", () => {
    vi.setSystemTime(new Date("2025-02-28"));
    const result = calculateAge("2024-02-29");

    expect(result.years).toBe(0);
    expect(result.months).toBe(11);
  });

  it("returns the original dob string", () => {
    vi.setSystemTime(new Date("2024-06-01"));
    const dob = "2020-01-15";
    const result = calculateAge(dob);

    expect(result.dob).toBe(dob);
  });
});
