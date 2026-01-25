import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import adviceRoute from "./api/advice/route";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware for Bearer Token Authentication
app.use(async (c, next) => {
  const auth = bearerAuth({
    token: c.env.API_TOKEN,
  });
  return auth(c, next);
});

// Register API routes
app.route("/api/advice", adviceRoute);

// Export the Hono app
export default app;
