import { generateText } from "ai";
import { Message } from "../../agent";
import { languageModel } from "../utils";
import draft_system_prompt from "./prompt.md";

export async function draftEmail(message: Message): Promise<string> {
  const model = await languageModel();
  // Generate classification using AI model
  const { output } = await generateText({
    model: model,
    system: draft_system_prompt,
    prompt: `Draft a reply to the following email:\n\nfrom:${message.from}\n\n subject:${message.subject}\n\n content:\n\n${message.raw}`,
  });

  return output;
}
