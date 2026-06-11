import type { Page } from "@playwright/test";

/**
 * TanStack Start server functions respond with seroval-encoded JSON
 * (header `x-tss-serialized: true`). This mini-encoder covers the value
 * shapes used in tests (plain objects, strings, numbers, booleans,
 * undefined/null) so Playwright can fulfill mocked RPC responses that the
 * client deserializer accepts. If a TanStack upgrade changes the wire
 * format, these tests will fail loudly — re-capture the format by
 * inspecting a real /_serverFn response.
 */
interface TssState {
  nextId: number;
}

type TssNode = Record<string, unknown>;

const CONSTANT_NODE = 2;
const NUMBER_NODE = 0;
const STRING_NODE = 1;
const OBJECT_NODE = 10;
const NULL_CONSTRUCTOR_NODE = 11;

function tssNode(value: unknown, state: TssState): TssNode {
  if (value === undefined) {
    return { t: CONSTANT_NODE, s: 1 };
  }
  if (value === null) {
    return { t: CONSTANT_NODE, s: 0 };
  }
  if (value === true) {
    return { t: CONSTANT_NODE, s: 2 };
  }
  if (value === false) {
    return { t: CONSTANT_NODE, s: 3 };
  }
  if (typeof value === "string") {
    return { t: STRING_NODE, s: value };
  }
  if (typeof value === "number") {
    return { t: NUMBER_NODE, s: value };
  }
  if (typeof value === "object") {
    const id = state.nextId;
    state.nextId += 1;
    const entries = Object.entries(value as Record<string, unknown>);
    return {
      t: OBJECT_NODE,
      i: id,
      p: {
        k: entries.map(([key]) => key),
        v: entries.map(([, entryValue]) => tssNode(entryValue, state)),
      },
      o: 0,
    };
  }
  throw new Error(`Unsupported mock value: ${typeof value}`);
}

export function serverFnResponseBody(result: unknown): string {
  const state: TssState = { nextId: 1 };
  const root = {
    t: OBJECT_NODE,
    i: 0,
    p: {
      k: ["result", "error", "context"],
      v: [
        tssNode(result, state),
        tssNode(undefined, state),
        {
          t: NULL_CONSTRUCTOR_NODE,
          i: state.nextId,
          p: { k: [], v: [] },
          o: 0,
        },
      ],
    },
    o: 0,
  };
  return JSON.stringify(root);
}

export interface MockServerFnOptions {
  result?: unknown;
  status?: number;
  delayMs?: number;
}

/**
 * Intercepts every server-function RPC issued by the page and fulfills it
 * with the given result (or failure status).
 */
export async function mockServerFn(
  page: Page,
  { result, status = 200, delayMs = 0 }: MockServerFnOptions
): Promise<void> {
  await page.route("**/_serverFn/**", async (route) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (status >= 400) {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
      return;
    }

    await route.fulfill({
      status,
      body: serverFnResponseBody(result),
      headers: {
        "content-type": "application/json",
        "x-tss-serialized": "true",
      },
    });
  });
}
