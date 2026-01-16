import { ToolLoopAgent } from "ai";
import { getContextTools, getEmailTools } from "../tools";
import type { Memory } from "../types";
import { log } from "../utils/logger";
import { retrieveModel } from "../utils/model-provider";
import { wrapToolsWithStateCapture } from "../utils/tool-wrapper";
import type { AgentExecutor, AgentResult } from "./agent";

/**
 * System prompt for the owner response agent
 */
const SYSTEM_PROMPT = `You are an AI assistant helping manage emails for Melek Somai. You are processing an email FROM the owner (Melek).

## Your Role

Analyze the owner's email and determine what actions to take. The owner may be:
1. **Replying to someone (CC'ing you)** - Learn from how they responded
2. **Sending you direct instructions** - Update your context/knowledge base
3. **Forwarding an email for you to handle** - Send a reply on their behalf

## Available Actions

- **updateContext**: Store important information for future reference
- **generateReplyDraft**: Draft an email response based on context (use this before sendEmail to compose thoughtful replies)
- **sendEmail**: Send an email. Choose recipient:
  - "contact" - reply to the external person
  - "owner" - notify Melek
  - "both" - reply to contact AND cc Melek

## Decision Framework

### If the owner CC'd you on a reply:
- Extract preferences or patterns from how they responded
- Update context if useful
- Do NOT send any emails

### If the owner sent you direct instructions:
- Update context with new preferences

### If the owner forwards an email to you:
- This is implicit delegation - the owner wants you to handle it
- Use generateReplyDraft to compose a thoughtful response
- Then use sendEmail with recipient "contact" to send it
- Unless it involves commitments, money, or sensitive matters
- Update context with any relevant information

### If the owner is asking for help with scheduling:
- Consider their known availability (from context)
- Use generateReplyDraft to compose a response with proposed times
- Then use sendEmail with recipient "contact" to send it
- Unless it involves firm commitments

## Important Guidelines

- Always update context when you learn something new about preferences
- Forwarded emails = delegation to act (send to contact)
- CC'd emails = observation only (learn, don't act)
- When in doubt about sensitive matters, don't send
`;

export interface OwnerAgentInput {
  prompt: string;
}

export interface OwnerAgentOutput {
  text: string;
}

/**
 * Creates an owner response agent that returns state updates in result
 *
 * @param env - Environment bindings
 * @param state - Current memory state (used for address resolution)
 */
export const createOwnerResponseAgent = async (
  env: Env,
  state: Memory
): Promise<AgentExecutor<OwnerAgentInput, OwnerAgentOutput>> => {
  log.debug("[owner-agent] creating", { contact: state.contact });

  const model = await retrieveModel(env);

  // Accumulator for state updates from tools
  const stateUpdates: Partial<Memory> = {};

  // Wrap tools to capture state updates
  const tools = wrapToolsWithStateCapture(
    {
      ...getContextTools(env, state),
      ...getEmailTools(env, state),
    },
    stateUpdates
  );

  const agent = new ToolLoopAgent({
    model,
    instructions: SYSTEM_PROMPT,
    tools,
  });

  return {
    execute: async (input): Promise<AgentResult<OwnerAgentOutput>> => {
      const { text } = await agent.generate({ prompt: input.prompt });
      return {
        output: { text },
        stateUpdates:
          Object.keys(stateUpdates).length > 0 ? stateUpdates : undefined,
      };
    },
  };
};
