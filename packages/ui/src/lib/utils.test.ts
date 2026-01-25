import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn()", () => {
  it("merges tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters falsy values", () => {
    expect(cn("p-2", false, undefined)).toBe("p-2");
  });
});
