# Testing

How this repository tests, and why. The rules are short; the rest is the reasoning and the reference implementation.

## Rules

1. **A pull request never talks to a third party.** No real API, no sandbox account, no test audience. CI must pass offline.
2. **Test our code at the boundary we own.** Mock the SDK in unit tests. In end-to-end tests, replace the vendor with a fake HTTP server and let everything on our side run for real: browser, Worker, server function, SDK.
3. **Keep the doubles honest with contract tests.** Run the real adapter against the real API on a schedule, never per PR. If the vendor changes behaviour, the contract test fails, and we update the fake and the mocks.
4. **Use native mechanisms only.** Cloudflare environments, Wrangler dev vars, Playwright web servers, Vitest configs. No custom build scripts, output directories, or task-runner plumbing that exists only for tests.
5. **Every side effect in a test must be explainable.** If a test run subscribes, emails, or notifies anyone, that is a bug in the tests.

## The three layers

| Layer | Runs | Third party is | Answers |
| --- | --- | --- | --- |
| Unit | `pnpm test` (Vitest `unit` project) | SDK mocked | Does our logic do the right thing with a given response? |
| End-to-end | `pnpm e2e` (Playwright, production build in workerd) | Fake HTTP server | Does the whole system, from the browser to the vendor's door, do the right thing? |
| Contract | Scheduled `contract` workflow, or `pnpm --filter <pkg> test:contract` | The real API | Are the response shapes our mocks and fakes assume still true? |

Unit and end-to-end run on every PR. Contract runs daily and on demand, with real credentials and a dedicated test resource on the vendor side.

## Why this and not a sandbox

A sandbox or test account still means a live API on every PR: it needs secrets in CI, it depends on the vendor being up, it counts against quotas, account-level webhooks still fire, and data accumulates unless tests clean up. It also tests the vendor more than it tests us. Fakes are fast, deterministic, and let us script failures a sandbox cannot produce on demand: outages, rate limits, malformed bodies.

This is the standard split: hermetic tests for the pipeline, periodic contract tests for the seam. See Google's hermetic servers and Fowler's integration contract tests.

## Reference implementation: the newsletter (Resend)

The site's subscribe form calls a TanStack server function, which calls `subscribeContact` in `packages/emailing`, which calls the Resend SDK.

**Unit** (`packages/emailing/tests/unit`, `apps/web/tests/unit`): the SDK is mocked with the response shapes it really returns. The SDK does not throw on API errors; it resolves `{ data: null, error }`.

**End-to-end** (`apps/web/tests/e2e/subscribe.spec.ts`):

- `wrangler.jsonc` declares a Cloudflare environment `e2e`, selected with `CLOUDFLARE_ENV=e2e`. It sets one var, `RESEND_BASE_URL`, which the SDK reads from `process.env`, and it is never deployed (`routes: []`).
- `apps/web/.dev.vars.e2e` holds dummy secrets and is committed. Wrangler loads `.dev.vars.<env>` before `.dev.vars`, so the e2e Worker cannot pick up real credentials.
- `playwright.config.ts` starts the fake (`tests/e2e/fakes/resend/server.ts`), then runs `CLOUDFLARE_ENV=e2e pnpm build && pnpm preview`. The preview is never reused.
- The fake implements only the endpoints we use, records every request, and scripts failures by address prefix (`outage-` gives a 500, `duplicate-` gives a 409 "already exists"). Behaviour lives in the address, not in shared state, so tests run in parallel.
- Tests assert on the UI and on what Resend would have received: path, bearer token, normalised address.

**Contract** (`packages/emailing/tests/contract/resend.test.ts`): runs `subscribeContact` against Resend with a unique address in a dedicated audience, checks the contact exists, checks a repeat still reports success, removes the contact. Needs `RESEND_API_KEY` and `RESEND_CONTRACT_AUDIENCE_ID`; skips without them.

**What it caught.** The adapter only handled thrown errors, so any Resend failure reported "Thanks for subscribing!". The unit tests had mocked a rejection the SDK never produces. The fake, sitting at the HTTP boundary, exercised the SDK's real behaviour and the outage test failed.

## Adding a new integration

1. Read the vendor's base URL from a var, with the production URL as the default. Most SDKs already support this; otherwise pass it explicitly.
2. Add the var to `env.e2e` in the Worker's `wrangler.jsonc`, pointing at a new fake, and add dummy secrets to `.dev.vars.e2e`.
3. Write the fake under `tests/e2e/fakes/<vendor>/`: the endpoints we use, request recording, scripted failures. Register it as a Playwright `webServer`.
4. Write e2e tests that assert both the UI and the recorded requests.
5. Write the contract test under `tests/contract/` in the package that owns the adapter, as a file of the package's `contract` Vitest project (see `packages/emailing/vitest.config.ts`). It runs the real adapter, verifies the assumptions the fake encodes, and cleans up. Add its secrets to the `contract` workflow.
6. Unit tests mock the SDK with its real response shapes.

## Layout

Every package keeps its tests under `tests/`, one folder per layer: `tests/unit`, `tests/e2e` (apps only), `tests/contract`. Each folder is a Vitest project or, for e2e, the Playwright `testDir`, so a layer is selected by name (`vitest --project contract`) and never by filename suffix.

## What we do not do

- No `.only` or `.skip` on committed tests, other than a contract test skipping when unconfigured.
- No shared mutable state between parallel tests. Encode behaviour in the input.
- No mocking of our own code in e2e tests. The only allowed interception on our side is Playwright routing the browser's request to the server function, to simulate transport failure.
- No secrets from `.env` files. Local secrets live in `.dev.vars` (Wrangler also reads `.env*` and the shell when required secrets are declared; a stray `.env.local` once fed real Resend keys to the e2e suite).
