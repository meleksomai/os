import type { Tool, ToolSet } from "ai";
import type { Memory } from "../types";
import type { ToolResult } from "../workflows/agent";

/**
 * Wraps tools to capture state updates from their results.
 * For AI-driven agents where tools are called by the model.
 */
export function wrapToolsWithStateCapture<T extends ToolSet>(
  tools: T,
  stateUpdates: Partial<Memory>
): T {
  const wrapped: Record<string, Tool> = {};

  for (const [name, tool] of Object.entries(tools)) {
    wrapped[name] = {
      ...tool,
      execute: async (...args: unknown[]) => {
        const result = await (tool.execute as (...a: unknown[]) => unknown)(
          ...args
        );

        // If tool returns stateUpdates, capture them
        if (isToolResult(result)) {
          Object.assign(stateUpdates, result.stateUpdates);
        }

        return result;
      },
    };
  }

  return wrapped as T;
}

/**
 * Type guard for ToolResult
 */
function isToolResult(value: unknown): value is ToolResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    ("stateUpdates" in value || !("stateUpdates" in value))
  );
}
