import { getEmailTools } from "../tools";
import type { Memory } from "../types";
import { log } from "../utils/logger";
import { WorkflowAgent } from "./workflow-agent";

/**
 * Output from the reply sender workflow
 */
export interface ReplySenderOutput {
  state?: Partial<Memory>;
}

/**
 * Creates a reply sender workflow agent
 *
 * This workflow:
 * 1. Classifies the incoming email
 * 2. If action is "reply": generates a draft and sends it
 * 3. Returns the result with action taken
 *
 * @param env - Environment bindings
 * @param state - Current agent memory state
 */
export const replySenderAgent = (env: Env, state: Memory) =>
  new WorkflowAgent({
    tools: getEmailTools(env, state),
    run: async ({ executeTool }): Promise<ReplySenderOutput | undefined> => {
      // Step 1: Classify
      const classification = await executeTool("classifyEmail", { state });

      // Step 2: Decide
      if (classification.action !== "reply") {
        log.info("[reply-workflow] decision", {
          action: classification.action,
          reason: "no reply needed",
        });
        return;
      }

      log.info("[reply-workflow] decision", { action: "reply" });

      // Step 3: Draft
      const draft = await executeTool("generateReplyDraft", { state });
      const originalEmail = state.messages.at(-1);

      if (!originalEmail) {
        log.error("[reply-workflow] error", {
          error: "no message to reply to",
        });
        throw new Error("No message to reply to");
      }

      // Step 4: Send (addresses resolved from state/env automatically)
      await executeTool("sendEmail", {
        recipient: "contact",
        subject: originalEmail.subject,
        content: draft,
      });

      return {
        state: {
          lastUpdated: new Date().toISOString(),
        },
      };
    },
  });
