import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { parseGitHubAlert } from "./gmf";

describe("parseGitHubAlert()", () => {
  describe("returns null for non-alert content", () => {
    it("returns null for plain text", () => {
      expect(parseGitHubAlert("Just some text")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseGitHubAlert("")).toBeNull();
    });

    it("returns null for null", () => {
      expect(parseGitHubAlert(null)).toBeNull();
    });

    it("returns null for undefined", () => {
      expect(parseGitHubAlert(undefined)).toBeNull();
    });

    it("returns null for whitespace-only string", () => {
      expect(parseGitHubAlert("   ")).toBeNull();
    });

    it("returns null for invalid alert format", () => {
      expect(parseGitHubAlert("[!INVALID] Some text")).toBeNull();
    });

    it("returns null when alert marker is not at start", () => {
      expect(parseGitHubAlert("Some text [!NOTE] here")).toBeNull();
    });
  });

  describe("parses all alert types", () => {
    it("parses NOTE alert", () => {
      const result = parseGitHubAlert("[!NOTE] This is a note");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("note");
      expect(result?.content).toBe("This is a note");
    });

    it("parses TIP alert", () => {
      const result = parseGitHubAlert("[!TIP] This is a tip");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("tip");
      expect(result?.content).toBe("This is a tip");
    });

    it("parses IMPORTANT alert", () => {
      const result = parseGitHubAlert("[!IMPORTANT] This is important");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("important");
      expect(result?.content).toBe("This is important");
    });

    it("parses WARNING alert", () => {
      const result = parseGitHubAlert("[!WARNING] This is a warning");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("warning");
      expect(result?.content).toBe("This is a warning");
    });

    it("parses CAUTION alert", () => {
      const result = parseGitHubAlert("[!CAUTION] This is a caution");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("caution");
      expect(result?.content).toBe("This is a caution");
    });
  });

  describe("case insensitivity", () => {
    it("parses lowercase alert type", () => {
      const result = parseGitHubAlert("[!note] Lowercase note");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("note");
    });

    it("parses mixed case alert type", () => {
      const result = parseGitHubAlert("[!NoTe] Mixed case note");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("note");
    });
  });

  describe("handles React elements", () => {
    it("parses alert in paragraph element", () => {
      const element = createElement("p", null, "[!NOTE] Note in paragraph");
      const result = parseGitHubAlert(element);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("note");
    });

    it("parses alert in nested elements", () => {
      const element = createElement(
        "p",
        null,
        createElement("strong", null, "[!WARNING] Bold warning")
      );
      const result = parseGitHubAlert(element);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("warning");
    });

    it("parses alert in array of children", () => {
      const children = ["[!TIP] ", "This is a tip"];
      const result = parseGitHubAlert(children);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("tip");
    });

    it("skips whitespace-only nodes to find alert", () => {
      const children = ["   ", "[!IMPORTANT] Important message"];
      const result = parseGitHubAlert(children);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("important");
    });

    it("handles element with no children", () => {
      const element = createElement("p", null);
      expect(parseGitHubAlert(element)).toBeNull();
    });
  });

  describe("content extraction", () => {
    it("removes alert marker from simple string", () => {
      const result = parseGitHubAlert("[!NOTE] Content here");
      expect(result?.content).toBe("Content here");
    });

    it("removes alert marker with trailing whitespace", () => {
      const result = parseGitHubAlert("[!NOTE]    Extra spaces");
      // The regex consumes trailing whitespace after the marker
      expect(result?.content).toBe("Extra spaces");
    });

    it("handles array with number content", () => {
      const result = parseGitHubAlert(["[!NOTE] ", 42]);
      expect(result).not.toBeNull();
      expect(result?.type).toBe("note");
      // Content preserves array structure with marker removed
      expect(result?.content).toEqual(["", 42]);
    });
  });
});
