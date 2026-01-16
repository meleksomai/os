import { getEmailTools } from "../tools";
import type { Memory, Message } from "../types";
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
 * 3. Returns the result with action taken, draft, and send result
 *
 * @param env - Environment bindings
 * @param state - Current agent memory state
 * @param fromAddress - Email address to send from
 */
export const replySenderAgent = (env: Env, state: Memory) =>
  new WorkflowAgent({
    tools: getEmailTools(env),
    run: async ({ executeTool }): Promise<ReplySenderOutput | undefined> => {
      let replyMessage: Message | null = null;

      // 1. Classify email
      const classification = await executeTool("classifyEmail", { state });

      log.info("email.classified", {
        intents: classification.intents,
        risk: classification.risk,
        action: classification.action,
        requiresApproval: classification.requires_approval,
      });

      // 2. If reply, proceed to draft and send
      if (classification.action !== "reply") {
        log.info("workflow.skipped", {
          reason: `action is ${classification.action}`,
        });
        return;
      }

      // 2.a. Generate draft
      const draft = await executeTool("generateReplyDraft", { state });
      const originalEmail = state.messages.at(-1);

      log.info("email.draft_generated", { draftLength: draft.length });

      if (!originalEmail) {
        log.error("workflow.error", { error: "No message to reply to" });
        throw new Error("No message to reply to");
      }

      replyMessage = {
        from: env.EMAIL_ROUTING_ADDRESS,
        to: originalEmail.from,
        subject: originalEmail.subject.startsWith("Re:")
          ? originalEmail.subject
          : `Re: ${originalEmail.subject}`,
        raw: draft,
        date: new Date().toISOString(),
        messageId: "",
        references: originalEmail.messageId
          ? [originalEmail.messageId, ...(originalEmail.references || [])]
          : [],
      };

      // 2.b. Send email
      await executeTool("sendEmail", replyMessage);

      // 3. Return result
      return {
        state: {
          lastUpdated: new Date().toISOString(),
          messages: [...state.messages, replyMessage],
        },
      };
    },
  });
