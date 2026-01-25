import { z } from "zod";

// Advice schema (the only data type we cache)
export const AdviceSchema = z.object({
  date: z.string(),
  summary: z.string(),
  age: z.string(),
});

export type Advice = z.infer<typeof AdviceSchema>;

// Cache keys
export const CACHE_KEYS = {
  LATEST: "advice-latest",
  byAge: (age: string) => `advice-${age}`,
} as const;

// TTL in seconds
export const ONE_DAY = 86400;

// Simple get with validation
export async function getAdvice(kv: KVNamespace): Promise<Advice | null> {
  const raw = await kv.get(CACHE_KEYS.LATEST);
  if (!raw) return null;

  const parsed = AdviceSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
}

// Simple set
export async function setAdvice(
  kv: KVNamespace,
  advice: Advice,
  age: string
): Promise<void> {
  const json = JSON.stringify(advice);

  await Promise.all([
    kv.put(CACHE_KEYS.byAge(age), json), // Archive (permanent)
    kv.put(CACHE_KEYS.LATEST, json, { expirationTtl: ONE_DAY }), // Latest (1 day TTL)
  ]);
}
