/**
 * Fake Resend API, owned by the package that wraps Resend.
 *
 * Used by this package's integration tests (in-process) and by apps'
 * end-to-end suites (as a standalone process, see serve.ts). The real SDK
 * talks to it by setting RESEND_BASE_URL, so everything on our side runs
 * unchanged and nothing leaves the machine.
 *
 * It implements only the endpoints we use, records every request for tests
 * to assert on, and answers with scripted failures for addresses carrying a
 * known prefix. Behaviour lives in the address, not in shared state, so
 * parallel tests never interfere.
 *
 * The response shapes mirror what the Resend SDK expects (`response.ok` or a
 * JSON error body). Whether they still match the real API is the job of the
 * contract tests (tests/contract), which run on a schedule.
 */
import { randomUUID } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import type { AddressInfo } from "node:net";

export const FAKE_RESEND_HOST = "127.0.0.1";
/** Port for the standalone server (serve.ts); apps point RESEND_BASE_URL here. */
export const FAKE_RESEND_PORT = Number(process.env.FAKE_RESEND_PORT ?? 4174);

/** Control endpoints, outside Resend's API surface. */
export const FAKE_HEALTH_PATH = "/__fake/health";
export const FAKE_REQUESTS_PATH = "/__fake/requests";

/** Email local-part prefixes that select a scripted answer. */
export const OUTAGE_PREFIX = "outage-";
export const DUPLICATE_PREFIX = "duplicate-";

export interface RecordedRequest {
  method: string;
  path: string;
  authorization: string | null;
  body: unknown;
}

export interface FakeResend {
  /** Base URL to put in RESEND_BASE_URL. */
  url: string;
  /** Requests received so far, optionally only those carrying this email. */
  requests(email?: string): RecordedRequest[];
  reset(): void;
  close(): Promise<void>;
}

const CREATE_CONTACT_PATH = /^\/audiences\/[^/]+\/contacts$/;
const BEARER_PREFIX = "Bearer ";

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const HTTP_SERVER_ERROR = 500;

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

/** Start a fake on `port` (0 picks a free one). */
export function startFakeResend(
  options: { host?: string; port?: number } = {}
): Promise<FakeResend> {
  const host = options.host ?? FAKE_RESEND_HOST;
  const port = options.port ?? 0;
  const requests: RecordedRequest[] = [];

  const select = (email?: string): RecordedRequest[] => {
    if (!email) {
      return [...requests];
    }
    const wanted = email.toLowerCase();
    return requests.filter((r) => emailOf(r.body)?.toLowerCase() === wanted);
  };

  const handleControl = (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL
  ): boolean => {
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
    reply(res, HTTP_OK, select(url.searchParams.get("email") ?? undefined));
    return true;
  };

  const handle = async (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> => {
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
  };

  const server: Server = createServer((req, res) => {
    handle(req, res).catch((error: unknown) => {
      resendError(
        res,
        HTTP_SERVER_ERROR,
        "fake_error",
        error instanceof Error ? error.message : String(error)
      );
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address() as AddressInfo;
      resolve({
        url: `http://${host}:${address.port}`,
        requests: select,
        reset: () => {
          requests.length = 0;
        },
        close: () =>
          new Promise<void>((done, fail) => {
            server.close((error) => (error ? fail(error) : done()));
          }),
      });
    });
  });
}
