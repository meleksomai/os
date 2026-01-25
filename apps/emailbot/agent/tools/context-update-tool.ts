import { generateText, tool } from "ai";
import { z } from "zod";
import { type Memory, MemorySchema } from "../types";
import { log } from "../utils/logger";
import { retrieveModel } from "../utils/model-provider";
import type { ToolResult } from "../workflows/agent";

// Output schema for context update
const ContextUpdateOutputSchema = z.object({
  data: z.object({
    context: z.string().describe("The updated context string"),
  }),
  stateUpdates: z
    .object({
      context: z.string(),
    })
    .optional(),
});

export const contextUpdateTool = (env: Env, _state: Memory) =>
  tool({
    description:
      "Update the agent's context based on a new email from the owner. Use this to extract and store relevant information that will help handle future emails.",
    inputSchema: z.object({
      state: MemorySchema.describe(
        "The current agent memory state with messages and context"
      ),
    }),
    outputSchema: ContextUpdateOutputSchema,
    execute: async ({
      state: inputState,
    }): Promise<ToolResult<{ context: string }>> => {
      const startTime = Date.now();
      try {
        const model = await retrieveModel(env);
        const message = inputState.messages.at(-1);

        const prompt = `Current context:
        ${inputState.context || "(empty)"}

        ---

        New email from:
        From: ${message?.from}
        Subject: ${message?.subject}
        Content:
        ${message?.raw}

        ---

        Please update the context based on this new email.`;

        const { text } = await generateText({
          model,
          system: SYSTEM_PROMPT,
          prompt,
        });

        const newContext = text.trim();

        log.info("[context-tool] updated", {
          durationMs: Date.now() - startTime,
        });

        return {
          data: { context: newContext },
          stateUpdates: { context: newContext },
        };
      } catch (err) {
        log.error("[context-tool] failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
  });

// ----------- System Prompt -----------

const SYSTEM_PROMPT = `You are a context management assistant. Your job is to maintain a concise, relevant context summary that helps the email agent make better decisions.

---

## Your Task

Given:
1. The current context (may be empty or contain prior information)
2. A new incoming email from the owner

Update the context by:
1. Extracting key information from the new email that would be useful for future email handling
2. Merging it with existing context, avoiding redundancy
3. Keeping the context focused and concise (under 2000 words)

---

## What to Include in Context

- Preferences expressed by the owner (e.g., "I'm not interested in sales calls", "Forward all scheduling requests")
- Important relationships (e.g., "John is my business partner", "Dr. Smith is my colleague")
- Ongoing projects or priorities mentioned
- Specific instructions for handling certain types of emails
- Availability or scheduling preferences
- Any other information that would help the agent handle future emails appropriately

---

## What NOT to Include

- Redundant information already in the context
- Trivial or one-time details unlikely to be useful again
- Sensitive information like passwords, account numbers, or personal identifiers
- Full email contents (summarize instead)

---

## Output Format

Return ONLY the updated context as plain text. Do not include any JSON, markdown formatting, or explanations. Just the context string that should be stored.

If the new email contains no useful context updates, return the existing context unchanged.
`;
