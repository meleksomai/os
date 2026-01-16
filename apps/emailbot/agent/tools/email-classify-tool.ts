import { generateText, Output, tool } from "ai";
import { z } from "zod";
import { MemorySchema } from "../types";
import { log } from "../utils/logger";
import { retrieveModel } from "../utils/model-provider";

/**
 * Email intent classification
 */
export const EmailIntentSchema = [
  "scheduling",
  "information_request",
  "action_request",
  "introduction_networking",
  "sales_vendor",
  "fyi_notification",
  "sensitive_legal_financial",
  "unknown_ambiguous",
];

/**
 * Email classification schema and type
 */
export const EmailClassificationSchema = z.object({
  intents: z.array(z.enum(EmailIntentSchema)).min(1),
  risk: z.enum(["low", "medium", "high"]),
  action: z.enum(["reply", "forward", "ignore"]),
  requires_approval: z.boolean(),
  comments: z.string().min(1).max(500),
});

export type EmailClassification = z.infer<typeof EmailClassificationSchema>;

// Tool for classifying emails

export const classifyEmailTool = (env: Env) =>
  tool({
    description:
      "Classify an email to determine its intent, risk level, and recommended action. Use this to triage incoming emails.",
    inputSchema: z.object({
      state: MemorySchema.describe(
        "The current agent memory state with messages and context"
      ),
    }),
    outputSchema: EmailClassificationSchema,
    execute: async ({ state }) => {
      const startTime = Date.now();
      try {
        const model = await retrieveModel(env);

        const message = state.messages[state.messages.length - 1];
        const contextMessages = state.messages
          .slice(0, -1)
          .slice(-10)
          .map((msg) => msg.raw)
          .join("\n\n---\n\n");
        const prompt = `Classify the following email:

        from:${message?.from}
        subject:${message?.subject}
        content:
        ${message?.raw}

        ----------------------
        Prior historical messages (last 10 messages sent prior to this email by the same sender):
        ${contextMessages}

        ----------------------
        Please keep in mind the context provided below that may help with classification:
        ${state.context}`;

        const { output } = await generateText({
          model,
          system: SYSTEM_PROMPT,
          output: Output.object({
            schema: EmailClassificationSchema,
          }),
          prompt: prompt,
        });

        log.debug("classify.completed", {
          durationMs: Date.now() - startTime,
          from: message?.from,
        });

        return output;
      } catch (err) {
        log.error("classify.failed", {
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - startTime,
        });
        throw err;
      }
    },
  });

// ----------- System Prompt -----------

const SYSTEM_PROMPT = `For every incoming email, follow this process strictly and return ONLY valid JSON that conforms to EmailClassificationSchema.

---

## About Melek (Context)

Melek Somai is a physician-technologist and executive working at the intersection of healthcare, software engineering, and AI. His work focuses 
on building pragmatic, high-impact systems rather than speculative or hype-driven technology.

---

Step 1 — Classify intent

Select one or more intents from the allowed list (do not invent new labels):

- scheduling
- information_request
- action_request
- introduction_networking
- sales_vendor
- fyi_notification
- sensitive_legal_financial
- unknown_ambiguous

Guidance:
- Use introduction_networking for polite outreach, introductions, compliments, or relationship-building notes, even if there is no explicit request.
- Use unknown_ambiguous only when intent genuinely cannot be determined from the content.
- Do NOT use unknown_ambiguous for friendly introductions with clear social intent.

---

Step 2 — Assess risk and authority

Answer internally (do not include the Q&A in the final output):

- Is this reversible?
- Does this require the user's approval before committing or sending?
- Does this involve commitments, money, contracts, credentials, compliance, or legal exposure?
- Do I have sufficient context to respond accurately?

Then assign risk:

- low: routine, reversible, no commitments, no sensitive content, high confidence
- medium: some ambiguity or mild commitment risk; safe to draft but not auto-send
- high: legal/financial/sensitive, identity/security concerns, or material commitment risk

---

Step 3 — Choose exactly one action

- reply: safe to draft a response (including polite acknowledgements or relationship-building replies)
- forward: requires human review; do not draft a full reply
- ignore: no response needed (spam, automated FYI, or clearly non-actionable)

Important clarification:
- "reply" is appropriate even when there is no explicit question or request, as long as a polite, professional acknowledgement would be reasonable and risk is low.
- Do not escalate solely due to the absence of a direct ask.

Default action rule for introduction_networking:
- If the email is clearly an introduction or friendly note AND contains no sales pitch, no request for money or contracts, and no sensitive/legal/financial content:
  - risk = low
  - action = reply
  - requires_approval = false
- Choose forward only if the message includes commercial terms, access requests, sensitive topics, or reputational risk.

If uncertain between two risks or actions, choose the safer option (higher risk / forward), except for low-risk introduction_networking, which should default to reply.

---

Step 4 — Explain the decision

Provide a short comment that references:
- the intents selected
- the risk level
- the reason for the chosen action

---

Output rules:

- Return ONLY JSON
- Do not include markdown, prose, or explanations outside the schema
- Use concise, professional wording in comments


import { z } from "zod";

export const EmailIntentSchema = z.enum([
  "scheduling",
  "information_request",
  "action_request",
  "introduction_networking",
  "sales_vendor",
  "fyi_notification",
  "sensitive_legal_financial",
  "unknown_ambiguous",
]);

export const EmailClassificationSchema = z.object({
  intents: z.array(EmailIntentSchema).min(1),

  risk: z.enum(["low", "medium", "high"]),

  action: z.enum(["reply", "forward", "ignore"]),

  // Whether the assistant should wait for explicit user approval before sending or committing.
  requires_approval: z.boolean(),

  // A short explanation for logs and UI surfaces.
  comments: z.string().min(1).max(500),
});

`;
