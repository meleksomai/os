import type { InferToolInput, InferToolOutput, ToolSet } from "ai";
import { log } from "../utils/logger";
import type { AgentExecutor, AgentResult } from "./agent";

/**
 * Context passed to the run function
 */
export interface WorkflowContext<TOOLS extends ToolSet> {
  executeTool: <K extends keyof TOOLS & string>(
    toolName: K,
    input: InferToolInput<TOOLS[K]>
  ) => Promise<InferToolOutput<TOOLS[K]>>;
}

/**
 * Settings for WorkflowAgent
 */
export interface WorkflowAgentSettings<TOOLS extends ToolSet, INPUT, OUTPUT> {
  tools: TOOLS;
  run: (
    context: WorkflowContext<TOOLS>,
    input: INPUT
  ) => Promise<AgentResult<OUTPUT>>;
}

/**
 * WorkflowAgent - Manual tool orchestration implementing AgentExecutor
 *
 * Unlike ToolLoopAgent where the AI decides tool calls, WorkflowAgent lets you
 * define the exact sequence of tool executions in the `run` function.
 *
 * Implements AgentExecutor for consistent interface across all agents.
 *
 * @example
 * ```typescript
 * const agent = new WorkflowAgent({
 *   tools: getEmailTools(env, state),
 *   run: async ({ executeTool }, input) => {
 *     const classifyResult = await executeTool("classifyEmail", { state });
 *     if (classifyResult.data.action === "reply") {
 *       const draftResult = await executeTool("generateReplyDraft", { state });
 *       return { output: { action: "replied", draft: draftResult.data } };
 *     }
 *     return { output: { action: "skipped" } };
 *   }
 * });
 *
 * const result = await agent.execute({});
 * ```
 */
export class WorkflowAgent<TOOLS extends ToolSet, INPUT, OUTPUT>
  implements AgentExecutor<INPUT, OUTPUT>
{
  readonly version = "agent-v1";
  private readonly settings: WorkflowAgentSettings<TOOLS, INPUT, OUTPUT>;

  constructor(settings: WorkflowAgentSettings<TOOLS, INPUT, OUTPUT>) {
    this.settings = settings;
  }

  /**
   * The tools available to this workflow
   */
  get tools(): TOOLS {
    return this.settings.tools;
  }

  /**
   * Execute the workflow - implements AgentExecutor interface
   */
  async execute(input: INPUT): Promise<AgentResult<OUTPUT>> {
    const executeTool = this.createExecuteTool();
    return this.settings.run({ executeTool }, input);
  }

  /**
   * Create the executeTool helper function
   */
  private createExecuteTool() {
    return async <K extends keyof TOOLS & string>(
      toolName: K,
      input: InferToolInput<TOOLS[K]>
    ): Promise<InferToolOutput<TOOLS[K]>> => {
      const tool = this.settings.tools[toolName];
      if (!tool?.execute) {
        log.error("[workflow-agent] tool not found", { tool: toolName });
        throw new Error(`Tool "${toolName}" has no execute function`);
      }

      const startTime = Date.now();
      log.debug("[workflow-agent] executing tool", { tool: toolName });

      try {
        const result = await tool.execute(input, {
          messages: [],
          toolCallId: `${toolName}-${Date.now()}`,
        });

        log.debug("[workflow-agent] tool done", {
          tool: toolName,
          durationMs: Date.now() - startTime,
        });

        return result;
      } catch (err) {
        log.error("[workflow-agent] tool failed", {
          tool: toolName,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    };
  }
}
