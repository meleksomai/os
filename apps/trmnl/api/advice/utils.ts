import { generateText } from "ai";
import { prompt } from "@/api/advice/prompt";
import { type Advice, setAdvice } from "@/utils/cache";
import { calculateAge } from "@/utils/calculate-age";
import { retrieveModel } from "@/utils/model";

/**
 * Generates new parenting advice based on baby's age and caches it.
 * Used by both cron job and manual refresh endpoint.
 */
export async function generateAndCacheAdvice(env: Env): Promise<Advice> {
  const age = calculateAge(env.BABY_DOB);
  const model = await retrieveModel(env);

  const { text } = await generateText({
    model,
    prompt: prompt(age),
  });

  const advice: Advice = {
    date: new Date().toISOString(),
    summary: text,
    age: age.description,
  };

  await setAdvice(env.TRMNL_CACHE_KV, advice, age.description);

  return advice;
}
