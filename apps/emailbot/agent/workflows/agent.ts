import type { Memory } from "../types";

/**
 * Result from any agent execution
 * Agents return what they did and what state updates they propose
 */
export interface AgentResult<T = unknown> {
  /** Output from the agent (can be text, structured data, etc.) */
  output: T;
  /** Proposed state updates (parent decides whether to apply) */
  stateUpdates?: Partial<Memory>;
}

/**
 * Tool result that may include state updates
 */
export interface ToolResult<T = unknown> {
  data: T;
  stateUpdates?: Partial<Memory>;
}

/**
 * AgentExecutor interface for consistent agent pattern
 * Agents are factories that return an executor with this interface
 */
export interface AgentExecutor<TInput, TOutput> {
  execute(input: TInput): Promise<AgentResult<TOutput>>;
}
