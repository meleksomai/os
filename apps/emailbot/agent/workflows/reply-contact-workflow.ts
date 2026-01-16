import { getEmailTools } from "../tools";
import type { Memory } from "../types";
import { log } from "../utils/logger";
import type { AgentExecutor, AgentResult } from "./agent";
import { WorkflowAgent } from "./workflow-agent";

export interface ReplyAgentOutput {
  action: "replied" | "skipped";
  emailId?: string;
}

/**
 * Creates a reply contact workflow agent
 *
 * This workflow:
 * 1. Classifies the incoming email
 * 2. If action is "reply": generates a draft and sends it
 * 3. Returns the result with action taken
 *
 * @param env - Environment bindings
 * @param state - Current agent memory state
 */
export const createReplyContactAgent = (
  env: Env,
  state: Memory
): AgentExecutor<void, ReplyAgentOutput> =>
  new WorkflowAgent({
    tools: getEmailTools(env, state),
    run: async ({ executeTool }): Promise<AgentResult<ReplyAgentOutput>> => {
      // Step 1: Classify
      const classifyResult = await executeTool("classifyEmail", { state });
      const classification = classifyResult.data;

      // Step 2: Decide
      if (classification.action !== "reply") {
        log.info("[reply-workflow] decision", {
          action: classification.action,
          reason: "no reply needed",
        });
        return { output: { action: "skipped" } };
      }

      log.info("[reply-workflow] decision", { action: "reply" });

      // Step 3: Draft
      const draftResult = await executeTool("generateReplyDraft", { state });
      const draft = draftResult.data;
      const originalEmail = state.messages.at(-1);

      if (!originalEmail) {
        log.error("[reply-workflow] error", {
          error: "no message to reply to",
        });
        throw new Error("No message to reply to");
      }

      // Step 4: Send (addresses resolved from state/env automatically)
      const sendResult = await executeTool("sendEmail", {
        recipient: "contact",
        subject: originalEmail.subject,
        content: draft,
      });

      return {
        output: {
          action: "replied",
          emailId: sendResult.data.id ?? undefined,
        },
        stateUpdates: {
          lastUpdated: new Date().toISOString(),
        },
      };
    },
  });
