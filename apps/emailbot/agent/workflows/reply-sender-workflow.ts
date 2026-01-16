import { getEmailTools } from "../tools";
import type { Memory, Message } from "../types";
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

      // 2. If reply, proceed to draft and send
      if (classification.action !== "reply") {
        return;
      }
      // 2.a. Generate draft
      const draft = await executeTool("generateReplyDraft", { state });
      const originalEmail = state.messages.at(-1);

      if (!originalEmail) {
        throw new Error("No message to reply to");
      }

      replyMessage = {
        from: env.EMAIL_ROUTING_ADDRESS,
        to: originalEmail.from,
        subject: originalEmail.subject.startsWith("Re:")
          ? originalEmail.subject
          : `Re: ${originalEmail.subject}`,
        raw: draft,
        date: new Date(),
        messageId: "", // Will be filled in by email sender
        references: originalEmail.messageId
          ? [originalEmail.messageId, ...(originalEmail.references || [])]
          : [],
      };

      // 2.b. Send email
      await executeTool("sendEmail", replyMessage);

      // 3. Return result
      return {
        state: {
          lastUpdated: new Date(),
          messages: [...state.messages, replyMessage],
        },
      };
    },
  });
