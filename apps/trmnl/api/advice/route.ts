import { Hono } from "hono";
import { generateAndCacheAdvice } from "@/api/advice/utils";
import { getAdvice } from "@/utils/cache";

const advice = new Hono<{ Bindings: Env }>();

advice.get("/", async (c) => {
  const data = await getAdvice(c.env.TRMNL_CACHE_KV);

  if (!data) {
    return c.json({ error: "No advice available" }, 404);
  }

  return c.json(data);
});

advice.get("/refresh", async (c) => {
  const newAdvice = await generateAndCacheAdvice(c.env);
  return c.json(newAdvice);
});

export default advice;
