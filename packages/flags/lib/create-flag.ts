import { flag } from "flags/next";

export const createFlag = (key: string, defaultValue = false) =>
  flag({
    key,
    defaultValue,
    decide() {
      // Basic implementation, always returns the default value
      // We can expand this later to include more complex logic
      // (e.g., user targeting, percentage rollouts, etc.)
      return this.defaultValue as boolean;
    },
  });
