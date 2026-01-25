import { beforeEach, describe, expect, it } from "vitest";
import { clearTranscript, createLogger, getTranscript, log } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    clearTranscript();
  });

  describe("createLogger", () => {
    it("should create a logger with all log levels", () => {
      const logger = createLogger("test");

      expect(logger).toHaveProperty("debug");
      expect(logger).toHaveProperty("info");
      expect(logger).toHaveProperty("warn");
      expect(logger).toHaveProperty("error");
    });

    it("should use the provided namespace", () => {
      const logger = createLogger("my-namespace");
      logger.info("test message");

      const transcript = getTranscript();
      expect(transcript).toContain("[my-namespace]");
    });
  });

  describe("log levels", () => {
    it("should store debug messages with correct level", () => {
      const logger = createLogger("test");
      logger.debug("debug message", { key: "value" });

      const transcript = getTranscript();
      expect(transcript).toContain("[DEBUG]");
      expect(transcript).toContain("debug message");
      expect(transcript).toContain("key: value");
    });

    it("should store info messages with correct level", () => {
      const logger = createLogger("test");
      logger.info("info message", { key: "value" });

      const transcript = getTranscript();
      expect(transcript).toContain("[INFO]");
      expect(transcript).toContain("info message");
      expect(transcript).toContain("key: value");
    });

    it("should store warn messages with correct level", () => {
      const logger = createLogger("test");
      logger.warn("warn message", { key: "value" });

      const transcript = getTranscript();
      expect(transcript).toContain("[WARN]");
      expect(transcript).toContain("warn message");
      expect(transcript).toContain("key: value");
    });

    it("should store error messages with correct level", () => {
      const logger = createLogger("test");
      logger.error("error message", { key: "value" });

      const transcript = getTranscript();
      expect(transcript).toContain("[ERROR]");
      expect(transcript).toContain("error message");
      expect(transcript).toContain("key: value");
    });

    it("should log without data parameter", () => {
      const logger = createLogger("test");
      logger.info("simple message");

      const transcript = getTranscript();
      expect(transcript).toContain("[INFO]");
      expect(transcript).toContain("simple message");
    });
  });

  describe("getTranscript", () => {
    it("should return 'No activity recorded.' when no logs exist", () => {
      const transcript = getTranscript();
      expect(transcript).toBe("No activity recorded.");
    });

    it("should return formatted transcript with log entries", () => {
      const logger = createLogger("test");
      logger.info("first message");
      logger.warn("second message");

      const transcript = getTranscript();

      expect(transcript).toContain("## Agent Activity Log");
      expect(transcript).toContain("[INFO]");
      expect(transcript).toContain("[WARN]");
      expect(transcript).toContain("[test]");
      expect(transcript).toContain("first message");
      expect(transcript).toContain("second message");
    });

    it("should include data as indented key-value pairs", () => {
      const logger = createLogger("test");
      logger.info("message with data", { userId: "123", action: "login" });

      const transcript = getTranscript();

      expect(transcript).toContain("userId: 123");
      expect(transcript).toContain("action: login");
    });

    it("should format object data as JSON", () => {
      const logger = createLogger("test");
      logger.info("message with object", { nested: { a: 1, b: 2 } });

      const transcript = getTranscript();

      expect(transcript).toContain("nested:");
      expect(transcript).toContain('"a": 1');
      expect(transcript).toContain('"b": 2');
    });

    it("should include timestamp in transcript", () => {
      const logger = createLogger("test");
      logger.info("timed message");

      const transcript = getTranscript();

      // Should contain time in HH:MM:SS format
      // biome-ignore lint/performance/useTopLevelRegex: unit testing
      expect(transcript).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("clearTranscript", () => {
    it("should clear all stored log entries", () => {
      const logger = createLogger("test");
      logger.info("message 1");
      logger.info("message 2");

      expect(getTranscript()).toContain("message 1");

      clearTranscript();

      expect(getTranscript()).toBe("No activity recorded.");
    });
  });

  describe("default log export", () => {
    it("should be a logger with 'app' namespace", () => {
      log.info("default logger message");

      const transcript = getTranscript();
      expect(transcript).toContain("[app]");
      expect(transcript).toContain("default logger message");
    });
  });

  describe("multiple loggers", () => {
    it("should store entries from multiple namespaces", () => {
      const logger1 = createLogger("service-a");
      const logger2 = createLogger("service-b");

      logger1.info("message from A");
      logger2.info("message from B");

      const transcript = getTranscript();

      expect(transcript).toContain("[service-a]");
      expect(transcript).toContain("[service-b]");
      expect(transcript).toContain("message from A");
      expect(transcript).toContain("message from B");
    });

    it("should maintain entry order across loggers", () => {
      const logger1 = createLogger("first");
      const logger2 = createLogger("second");

      logger1.info("1st");
      logger2.info("2nd");
      logger1.info("3rd");

      const transcript = getTranscript();
      const firstIndex = transcript.indexOf("1st");
      const secondIndex = transcript.indexOf("2nd");
      const thirdIndex = transcript.indexOf("3rd");

      expect(firstIndex).toBeLessThan(secondIndex);
      expect(secondIndex).toBeLessThan(thirdIndex);
    });
  });
});
