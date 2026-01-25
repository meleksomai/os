import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cronJob } from "./api/advice/cron";
import adviceRoute from "./api/advice/route";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware for Bearer Token Authentication
app.use((c, next) => {
  const auth = bearerAuth({
    token: c.env.API_TOKEN,
  });
  return auth(c, next);
});

// Register API routes
app.route("/api/advice", adviceRoute);

// Export both the app and a scheduled function
export default {
  // The Hono app handles regular HTTP requests
  fetch: app.fetch,

  // The scheduled function handles Cron triggers
  scheduled: cronJob,
};
