import { generateAndCacheAdvice } from "@/api/advice/utils";

export const cronJob = async (
  _controller: ScheduledController,
  env: Env,
  _ctx: ExecutionContext
) => {
  console.log("cron processing triggered...");
  await generateAndCacheAdvice(env);
};
