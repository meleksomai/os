/**
 * Simple structured logger for Cloudflare Workers
 *
 * Inspired by debug/pino - minimal, namespaced, JSON output.
 * Collects logs in memory for transcript generation.
 *
 * Usage:
 *   const log = createLogger("email");
 *   log.info("received", { from, subject });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  ns: string;
  level: LogLevel;
  msg: string;
  ts: string;
  data?: Record<string, unknown>;
}

// In-memory log storage
const entries: LogEntry[] = [];

/**
 * Create a namespaced logger
 */
export function createLogger(namespace: string) {
  const write = (
    level: LogLevel,
    msg: string,
    data?: Record<string, unknown>
  ) => {
    const entry: LogEntry = {
      ns: namespace,
      level,
      msg,
      ts: new Date().toISOString(),
      ...(data && { data }),
    };

    entries.push(entry);

    // Output to console as JSON (Cloudflare Workers best practice)
    const output = { ns: namespace, level, msg, ...data };
    switch (level) {
      case "debug":
        console.debug(output);
        break;
      case "info":
        console.log(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "error":
        console.error(output);
        break;
    }
  };

  return {
    debug: (msg: string, data?: Record<string, unknown>) =>
      write("debug", msg, data),
    info: (msg: string, data?: Record<string, unknown>) =>
      write("info", msg, data),
    warn: (msg: string, data?: Record<string, unknown>) =>
      write("warn", msg, data),
    error: (msg: string, data?: Record<string, unknown>) =>
      write("error", msg, data),
  };
}

/**
 * Get transcript as markdown
 */
export function getTranscript(): string {
  if (entries.length === 0) {
    return "No activity recorded.";
  }

  const lines: string[] = ["## Agent Activity Log\n"];

  for (const entry of entries) {
    const time = new Date(entry.ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const level = `[${entry.level.toUpperCase()}]`;
    const ns = `[${entry.ns}]`;

    lines.push(`${level} ${time} ${ns} ${entry.msg}`);

    // Add data as indented key-value pairs
    if (entry.data) {
      for (const [key, value] of Object.entries(entry.data)) {
        const formatted =
          typeof value === "object"
            ? JSON.stringify(value, null, 2).split("\n").join("\n      ")
            : String(value);
        lines.push(`    ${key}: ${formatted}`);
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Clear all stored entries
 */
export function clearTranscript(): void {
  entries.length = 0;
}

// Default logger for backwards compatibility
export const log = createLogger("app");
