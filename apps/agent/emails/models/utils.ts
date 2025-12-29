import { env } from "cloudflare:workers";
import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModel } from "ai";

export const languageModel = async (
  version: string = "gpt-5.2"
): Promise<LanguageModel> => {
  const url = await env.AI.gateway(env.CLOUDFLARE_AI_GATEWAY_ID).getUrl(
    "openai"
  );
  console.log("Classifying email content...", url);
  const model = createOpenAI({
    baseURL: url,
    apiKey: env.OPENAI_API_KEY,
    headers: {
      "cf-aig-authorization": `Bearer ${env.CLOUDFLARE_AI_GATEWAY_TOKEN}`,
    },
  });

  return model.languageModel(version);
};
