import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import classification_email_system_prompt from "../prompts/classifier";
import draft_email_system_prompt from "../prompts/writer";
import { Memory } from "../types";

/**
 * Email intent classification
 */
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

/**
 * Email classification schema and type
 */
export const EmailClassificationSchema = z.object({
  intents: z.array(EmailIntentSchema).min(1),
  risk: z.enum(["low", "medium", "high"]),
  action: z.enum(["reply", "forward", "ignore"]),
  requires_approval: z.boolean(),
  comments: z.string().min(1).max(500),
});

/**
 * LLM service implementation using Vercel AI SDK
 */
export class LLMTool {
  constructor(private readonly env: Env) {}

  /**
   * Get the language model provider with AI Gateway configuration
   */
  private async modelProvider() {
    const url = await this.env.AI.gateway(
      this.env.CLOUDFLARE_AI_GATEWAY_ID
    ).getUrl("openai");

    console.log("Creating language model...", url);

    const model = createOpenAI({
      baseURL: url,
      apiKey: this.env.OPENAI_API_KEY,
      headers: {
        "cf-aig-authorization": `Bearer ${this.env.CLOUDFLARE_AI_GATEWAY_TOKEN}`,
      },
    });

    return model.languageModel("gpt-5.2");
  }

  /**
   * Classify an email using LLM
   */
  async classifyEmail(state: Memory) {
    const model = await this.modelProvider();

    console.log("Classifying email using LLM...");
    const { output } = await generateText({
      model,
      system: classification_email_system_prompt,
      output: Output.object({
        schema: EmailClassificationSchema,
      }),
      prompt: this.buildClassificationPrompt(state),
    });

    return output;
  }

  /**
   * Generate a reply draft for an email using LLM
   */
  async generateReplyDraft(state: Memory): Promise<string> {
    const model = await this.modelProvider();

    const { output } = await generateText({
      model,
      system: draft_email_system_prompt,
      prompt: this.buildReplyPrompt(state),
    });

    return output;
  }

  /**
   * Build classification prompt with message and context
   */
  private buildClassificationPrompt(state: Memory): string {
    const message = state.messages[state.messages.length - 1];
    // last 10 messages as context excluding the current message
    const contextMessages = state.messages
      .slice(0, -1)
      .slice(-10)
      .map((msg) => msg.raw)
      .join("\n\n---\n\n");
    return `Classify the following email:

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
  }

  /**
   * Build reply prompt with message and context
   */
  private buildReplyPrompt(state: Memory): string {
    const message = state.messages[state.messages.length - 1];
    const context = state.context;
    // last 10 messages as context excluding the current message
    const contextMessages = state.messages
      .slice(0, -1)
      .slice(-10)
      .map((msg) => msg.raw)
      .join("\n\n---\n\n");
    return `Draft a reply to the following email:

from:${message?.from}
subject:${message?.subject}
content:
${message?.raw}.

----------------------
Prior historical messages (last 10 messages sent prior to this email by the same sender):
${contextMessages}
    
----------------------
Please keep in mind the context provided below that may help with classification:
${context}`;
  }
}
