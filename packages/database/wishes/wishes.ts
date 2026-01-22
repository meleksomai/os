import { getSupabaseClient } from "../lib/client";
import type { PublicWish, Wish, WishInput } from "./schema";

export type { PublicWish, Wish, WishInput } from "./schema";
export { WISHES_TABLE_SCHEMA } from "./schema";

export const wishes = {
  async submit(input: WishInput): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("wishes").insert({
      name: input.name,
      email: input.email,
      message: input.message,
      is_public: input.isPublic,
      reviewed: null,
    });

    if (error) {
      throw new Error(`Failed to submit wish: ${error.message}`);
    }
  },

  async read(): Promise<Wish[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to read wishes: ${error.message}`);
    }

    return data ?? [];
  },

  async readPublic(): Promise<PublicWish[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("wishes")
      .select("id, name, message, created_at")
      .eq("is_public", true)
      .eq("reviewed", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to read public wishes: ${error.message}`);
    }

    return data ?? [];
  },
};
