import { generateText, Output } from "ai";
import { z } from "zod";
import { Message } from "../../agent";
import { languageModel } from "../utils";
import classification_prompt from "./prompt.md";

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

export type EmailClassification = z.infer<typeof EmailClassificationSchema>;

export async function classifyEmailContent(
  message: Message
): Promise<EmailClassification> {
  const model = await languageModel();

  // Generate classification using AI model
  const { output } = await generateText({
    model: model,
    system: classification_prompt,
    output: Output.object({
      schema: EmailClassificationSchema,
    }),
    prompt: `Classify the following email:\n\nfrom:${message.from}\n\n subject:${message.subject}\n\n content:\n\n${message.raw}`,
  });

  return output;
}
