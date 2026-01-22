import { WISHES_TABLE_SCHEMA, wishes } from "./wishes/wishes";

export const db = {
  wishes,
};

export const schemas = {
  wishes: WISHES_TABLE_SCHEMA,
};

export type { PublicWish, Wish, WishInput } from "./wishes/wishes";
