import { generateText } from "ai";
import { calculateAge } from "@/utils/calculate-age";
import { retrieveModel } from "@/utils/model";
import { prompt } from "./prompt";

export const cronJob = async (
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
) => {
  console.log("cron processing triggered...");

  // Calculate age
  const age = calculateAge(env.BABY_DOB);

  // Generate parenting advice using the model
  const model = await retrieveModel(env);

  const { text } = await generateText({
    model: model,
    prompt: prompt(age),
  });

  const result = {
    date: new Date().toISOString(),
    summary: text,
    age: age.description,
  };

  // Store the advice in KV storage
  env.TRMNL_CACHE_KV.put(`advice-${age.description}`, JSON.stringify(result)); // Store by age description for history
  env.TRMNL_CACHE_KV.put("advice-latest", JSON.stringify(result), {
    expirationTtl: 86400,
  }); // Cache for 1 day
};
