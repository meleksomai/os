/**
 * Fake Resend API for the end-to-end suite.
 *
 * The e2e Worker (wrangler.jsonc `env.e2e`) points the Resend SDK here through
 * RESEND_BASE_URL, so the real server function runs inside workerd and makes
 * a real HTTP call, but nothing leaves the machine. The fake implements only
 * the endpoints the site uses, records every request for the tests to assert
 * on, and answers with scripted failures for addresses carrying a known
 * prefix (see shared.ts).
 *
 * The response shapes mirror what the Resend SDK expects (`response.ok` or a
 * JSON error body). Whether they still match the real API is the job of the
 * contract test in packages/emailing, which runs on a schedule against a
 * dedicated Resend audience.
 *
 * Run with `node tests/e2e/fakes/resend/server.ts` (Node 24 strips the types).
 */
import { randomUUID } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  DUPLICATE_PREFIX,
  FAKE_HEALTH_PATH,
  FAKE_REQUESTS_PATH,
  FAKE_RESEND_HOST,
  FAKE_RESEND_PORT,
  OUTAGE_PREFIX,
  type RecordedRequest,
} from "./shared.ts";

const CREATE_CONTACT_PATH = /^\/audiences\/[^/]+\/contacts$/;
const BEARER_PREFIX = "Bearer ";

const HTTP_CREATED = 201;
const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const HTTP_SERVER_ERROR = 500;

const requests: RecordedRequest[] = [];

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw.length > 0 ? JSON.parse(raw) : null;
}

function reply(res: ServerResponse, status: number, body?: unknown): void {
  if (body === undefined) {
    res.writeHead(status);
    res.end();
    return;
  }
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function resendError(
  res: ServerResponse,
  statusCode: number,
  name: string,
  message: string
): void {
  reply(res, statusCode, { statusCode, name, message });
}

function emailOf(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "email" in body) {
    const { email } = body as { email: unknown };
    return typeof email === "string" ? email : null;
  }
  return null;
}

function handleControl(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
): boolean {
  if (url.pathname === FAKE_HEALTH_PATH) {
    reply(res, HTTP_OK, { ok: true });
    return true;
  }
  if (url.pathname !== FAKE_REQUESTS_PATH) {
    return false;
  }
  if (req.method === "DELETE") {
    requests.length = 0;
    reply(res, HTTP_NO_CONTENT);
    return true;
  }
  const email = url.searchParams.get("email")?.toLowerCase();
  const matching = email
    ? requests.filter((r) => emailOf(r.body)?.toLowerCase() === email)
    : requests;
  reply(res, HTTP_OK, matching);
  return true;
}

function handleCreateContact(
  res: ServerResponse,
  recorded: RecordedRequest
): void {
  const email = emailOf(recorded.body);
  if (!email) {
    resendError(
      res,
      HTTP_UNPROCESSABLE,
      "validation_error",
      "The email field is required."
    );
    return;
  }
  if (email.startsWith(OUTAGE_PREFIX)) {
    resendError(
      res,
      HTTP_SERVER_ERROR,
      "application_error",
      "Internal server error. We are unable to process your request right now, please try again later."
    );
    return;
  }
  if (email.startsWith(DUPLICATE_PREFIX)) {
    resendError(
      res,
      HTTP_CONFLICT,
      "validation_error",
      "Contact already exists"
    );
    return;
  }
  reply(res, HTTP_CREATED, { object: "contact", id: randomUUID() });
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (handleControl(req, res, url)) {
    return;
  }

  const recorded: RecordedRequest = {
    method: req.method ?? "GET",
    path: url.pathname,
    authorization: req.headers.authorization ?? null,
    body: await readBody(req),
  };
  requests.push(recorded);

  if (!recorded.authorization?.startsWith(BEARER_PREFIX)) {
    resendError(
      res,
      HTTP_UNAUTHORIZED,
      "missing_api_key",
      "Missing API key in the authorization header"
    );
    return;
  }
  if (req.method === "POST" && CREATE_CONTACT_PATH.test(url.pathname)) {
    handleCreateContact(res, recorded);
    return;
  }
  resendError(
    res,
    HTTP_NOT_FOUND,
    "not_found",
    "Endpoint not implemented by the fake"
  );
}

createServer((req, res) => {
  handle(req, res).catch((error: unknown) => {
    resendError(
      res,
      HTTP_SERVER_ERROR,
      "fake_error",
      error instanceof Error ? error.message : String(error)
    );
  });
}).listen(FAKE_RESEND_PORT, FAKE_RESEND_HOST);
