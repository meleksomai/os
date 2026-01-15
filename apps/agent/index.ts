import { routeAgentEmail } from "agents";
// biome-ignore lint/performance/noBarrelFile: required
import { HelloEmailAgent } from "./agent";
import { createThreadBasedEmailResolver } from "./resolvers";

export { HelloEmailAgent } from "./agent";

export default {
  async email(message: ForwardableEmailMessage, env: Env) {
    console.log("Received email message for routing:");
    await routeAgentEmail(message, env, {
      resolver: createThreadBasedEmailResolver(
        HelloEmailAgent.name,
        env.EMAIL_LOOKUP_KV
      ),
    });
  },

  fetch(request: Request) {
    console.log("Received fetch request:", request.url);
    return new Response(`${HelloEmailAgent.name} is running.`);
  },
};
