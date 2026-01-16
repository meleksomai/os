import type { InferToolInput, InferToolOutput, ToolSet } from "ai";

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
export interface WorkflowAgentSettings<TOOLS extends ToolSet, OUTPUT> {
  tools: TOOLS;
  run: (context: WorkflowContext<TOOLS>) => Promise<OUTPUT>;
}

/**
 * WorkflowAgent - Manual tool orchestration with the same API as ToolLoopAgent
 *
 * Unlike ToolLoopAgent where the AI decides tool calls, WorkflowAgent lets you
 * define the exact sequence of tool executions in the `run` function.
 *
 * @example
 * ```typescript
 * const agent = new WorkflowAgent({
 *   tools: getEmailTools(env),
 *   run: async ({ executeTool }) => {
 *     const classification = await executeTool("classifyEmail", { state });
 *     if (classification.action === "reply") {
 *       const draft = await executeTool("generateReplyDraft", { state });
 *       return { action: "replied", draft };
 *     }
 *     return { action: classification.action };
 *   }
 * });
 *
 * const result = await agent.generate();
 * ```
 */
export class WorkflowAgent<TOOLS extends ToolSet, OUTPUT> {
  readonly version = "agent-v1";
  private readonly settings: WorkflowAgentSettings<TOOLS, OUTPUT>;

  constructor(settings: WorkflowAgentSettings<TOOLS, OUTPUT>) {
    this.settings = settings;
  }

  /**
   * The tools available to this workflow
   */
  get tools(): TOOLS {
    return this.settings.tools;
  }

  /**
   * Execute the workflow (non-streaming)
   * Same signature as ToolLoopAgent.generate()
   */
  async generate(options?: {
    abortSignal?: AbortSignal;
    timeout?: number;
  }): Promise<OUTPUT> {
    const executeTool = this.createExecuteTool();
    return this.settings.run({ executeTool });
  }

  /**
   * Execute the workflow (streaming)
   * Same signature as ToolLoopAgent.stream()
   * Note: Workflows are synchronous by nature, so this just wraps generate()
   */
  async stream(options?: {
    abortSignal?: AbortSignal;
    timeout?: number;
  }): Promise<OUTPUT> {
    return this.generate(options);
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
        throw new Error(`Tool "${toolName}" has no execute function`);
      }
      return tool.execute(input, {
        messages: [],
        toolCallId: `${toolName}-${Date.now()}`,
      });
    };
  }
}
