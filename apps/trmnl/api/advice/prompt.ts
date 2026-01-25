import type { AgeCalculation } from "@/utils/calculate-age";

/** Parenting topics to rotate through for comprehensive coverage */
const TOPICS = [
  "sleep habits and routines",
  "nutrition and feeding",
  "emotional regulation",
  "motor skill development",
  "language and communication",
  "social development",
  "cognitive stimulation",
  "safety and childproofing",
  "bonding and attachment",
  "play and learning",
  "health and wellness",
  "discipline and boundaries",
  "independence and self-care",
  "sensory development",
  "routine and transitions",
] as const;

/** Select a topic based on current date (deterministic per day, rotates through all topics) */
function getTodaysTopic(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % TOPICS.length;
  return TOPICS[index] ?? TOPICS[0];
}

export const prompt = (age: AgeCalculation) => {
  const topic = getTodaysTopic();

  return `You are a parenting advisor. Give ONE brief, actionable tip about "${topic}" for a ${age.description} child.

RULES:
- Maximum 50 words
- Be specific to this age
- Evidence-based (AAP, CDC, or established research)
- Practical and actionable
- No greetings, sign-offs, or fluff

Respond with just the tip, nothing else.`;
};
