import { generateText } from "ai";
import { Hono } from "hono";
import { calculateAge } from "@/utils/calculate-age";
import { retrieveModel } from "@/utils/model";
import { prompt } from "./prompt";

const advice = new Hono<{ Bindings: Env }>();

advice.get("/", async (c) => {
  // Retrieve the information from the KV
  const cached = await c.env.TRMNL_CACHE_KV.get("advice-latest");

  // Parse the cached data
  const data = JSON.parse(cached || "{}");

  // Return the result as JSON
  return c.json(data);
});

export default advice;
