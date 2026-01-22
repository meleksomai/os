import { createClient } from "@supabase/supabase-js";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseClient() {
  const supabaseUrl = getEnvVar("SUPABASE_URL");
  const supabaseKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, supabaseKey);
}
