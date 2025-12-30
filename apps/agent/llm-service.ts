import { env } from "cloudflare:workers";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { renderEmail } from "./emails/renderer";
import classification_email_system_prompt from "./prompts/classifier";
import draft_email_system_prompt from "./prompts/writer";
import {
  type EmailClassification,
  EmailClassificationSchema,
  type Message,
} from "./types";

/**
 * LLM service implementation using Vercel AI SDK
 */
export class LLMService {
  private async modelProvider() {
    const url = await env.AI.gateway(env.CLOUDFLARE_AI_GATEWAY_ID).getUrl(
      "openai"
    );
    console.log("Creating language model...", url);
    const model = createOpenAI({
      baseURL: url,
      apiKey: env.OPENAI_API_KEY,
      headers: {
        "cf-aig-authorization": `Bearer ${env.CLOUDFLARE_AI_GATEWAY_TOKEN}`,
      },
    });
    return model.languageModel("gpt-5.2");
  }

  /**
   * Classify an email using LLM
   */
  async classifyEmail(
    message: Message,
    context: string
  ): Promise<EmailClassification> {
    const model = await this.modelProvider();

    const { output } = await generateText({
      model,
      system: classification_email_system_prompt,
      output: Output.object({
        schema: EmailClassificationSchema,
      }),
      prompt: this.buildClassificationPrompt(message, context),
    });

    return output;
  }

  /**
   * Generate a reply draft for an email using LLM
   */
  async generateReplyDraft(message: Message, context: string): Promise<string> {
    const model = await this.modelProvider();

    const { output } = await generateText({
      model,
      system: draft_email_system_prompt,
      prompt: this.buildReplyPrompt(message, context),
    });

    return await renderEmail(output);
  }

  /**
   * Build classification prompt with message and context
   */
  private buildClassificationPrompt(message: Message, context: string): string {
    return `Classify the following email:

from:${message.from}
subject:${message.subject}
content:
${message.raw}

Please keep in mind the context provided below that may help with classification:
${context}`;
  }

  /**
   * Build reply prompt with message and context
   */
  private buildReplyPrompt(message: Message, context: string): string {
    return `Draft a reply to the following email:

from:${message.from}
subject:${message.subject}
content:
${message.raw}.

Please keep in mind the context provided below that may help with classification:

${context}`;
  }
}
