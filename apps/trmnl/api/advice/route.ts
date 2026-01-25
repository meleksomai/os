import { generateText } from "ai";
import { Hono } from "hono";
import { calculateAge } from "@/utils/calculate-age";
import { retrieveModel } from "@/utils/model";
import { prompt } from "./prompt";

const advice = new Hono<{ Bindings: Env }>();

advice.get("/", async (c) => {
  // Calculate age
  const age = calculateAge(c.env.BABY_DOB);

  // Generate parenting advice using the model
  const model = await retrieveModel(c.env);

  const { text } = await generateText({
    model: model,
    prompt: prompt(age),
  });

  // Return the result as JSON
  return c.json({
    date: new Date().toISOString(),
    summary: text,
    age: age.description,
  });
});

export default advice;
