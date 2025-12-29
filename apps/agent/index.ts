import { createCatchAllEmailResolver, routeAgentEmail } from "agents";

// biome-ignore lint/performance/noBarrelFile: required
export { HelloEmailAgent } from "./emails/agent";

export default {
  async email(message: ForwardableEmailMessage, env: Env) {
    console.log("Received email message for routing:");
    await routeAgentEmail(message, env, {
      resolver: createCatchAllEmailResolver("HelloEmailAgent", message.from),
    });
  },
};
