import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export function retrieveModel(env: Env): LanguageModel {
  // const url = await env.AI.gateway(env.AI_GATEWAY_ID).getUrl("openai");

  const model = createOpenAI({
    // baseURL: url,
    apiKey: env.OPENAI_API_KEY,
    // headers: {
    //   "cf-aig-authorization": `Bearer ${env.CLOUDFLARE_AI_GATEWAY_TOKEN}`,
    // },
  });

  return model.languageModel("gpt-5-mini");
}
