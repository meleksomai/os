/**
 * Structured logger for Cloudflare Workers
 *
 * Uses native console methods with JSON output for Workers Logs queryability.
 * No external dependencies - follows Cloudflare best practices.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface Logger {
  debug: (event: string, context?: LogContext) => void;
  info: (event: string, context?: LogContext) => void;
  warn: (event: string, context?: LogContext) => void;
  error: (event: string, context?: LogContext) => void;
}

const formatLog = (level: LogLevel, event: string, context?: LogContext) => ({
  level,
  event,
  timestamp: new Date().toISOString(),
  ...context,
});

export const log: Logger = {
  debug: (event, context) => console.debug(formatLog("debug", event, context)),
  info: (event, context) => console.log(formatLog("info", event, context)),
  warn: (event, context) => console.warn(formatLog("warn", event, context)),
  error: (event, context) => console.error(formatLog("error", event, context)),
};
