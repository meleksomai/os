import { routeAgentEmail } from "agents";
import { createThreadBasedEmailResolver } from "./resolvers";

// biome-ignore lint/performance/noBarrelFile: required
export { HelloEmailAgent } from "./agent";

export default {
  async email(message: ForwardableEmailMessage, env: Env) {
    console.log("Received email message for routing:");
    await routeAgentEmail(message, env, {
      resolver: createThreadBasedEmailResolver(
        "HelloEmailAgent",
        env.EMAIL_ROUTING_DESTINATION,
        env.EMAIL_LOOKUP_KV
      ),
    });
  },
};
