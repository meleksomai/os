# Testing

How this repository tests, and why. The rules are short; the rest is the reasoning and the reference implementation.

## Rules

1. **A pull request never talks to a third party.** No real API, no sandbox account, no test audience. CI must pass offline.
2. **Test our code at the boundary we own.** Mock the SDK in unit tests. In integration and end-to-end tests, replace the vendor with a fake HTTP server and let everything on our side run for real: SDK, adapter, and for e2e the browser, Worker, and server function too.
3. **Keep the doubles honest with contract tests.** Run the real adapter against the real API on a schedule, never per PR. If the vendor changes behaviour, the contract test fails, and we update the fake and the mocks.
4. **Use native mechanisms only.** Cloudflare environments, Wrangler dev vars, Playwright web servers, Vitest projects. No custom build scripts, output directories, or task-runner plumbing that exists only for tests.
6. **The package that wraps a vendor owns everything about that vendor:** the adapter, the fake, the integration tests, and the contract tests. Apps own the end-to-end tests, because only an app has a system to drive.
5. **Every side effect in a test must be explainable.** If a test run subscribes, emails, or notifies anyone, that is a bug in the tests.

## The three layers

| Layer | Where | Runs | Third party is | Answers |
| --- | --- | --- | --- | --- |
| Unit | every package, `tests/unit` | `pnpm test` (Vitest `unit` project) | SDK mocked | Does our logic do the right thing with a given response? |
| Integration | the package that wraps the vendor, `tests/integration` | `pnpm test` (Vitest `integration` project) | Fake HTTP server, in-process | Does our adapter plus the real SDK do the right thing over HTTP? |
| End-to-end | apps, `tests/e2e` | `pnpm e2e` (Playwright, production build in workerd) | Fake HTTP server, as a process | Does the whole system, from the browser to the vendor's door, do the right thing? |
| Contract | the package that wraps the vendor, `tests/contract` | scheduled `contract` workflow, or `pnpm --filter <pkg> test:contract` | The real API | Are the response shapes our mocks and fakes assume still true? |

Unit, integration, and end-to-end run on every PR. Contract runs daily and on demand, with real credentials and a dedicated test resource on the vendor side.

## Why this and not a sandbox

A sandbox or test account still means a live API on every PR: it needs secrets in CI, it depends on the vendor being up, it counts against quotas, account-level webhooks still fire, and data accumulates unless tests clean up. It also tests the vendor more than it tests us. Fakes are fast, deterministic, and let us script failures a sandbox cannot produce on demand: outages, rate limits, malformed bodies.

This is the standard split: hermetic tests for the pipeline, periodic contract tests for the seam. See Google's hermetic servers and Fowler's integration contract tests.

## Reference implementation: the newsletter (Resend)

The site's subscribe form calls a TanStack server function, which calls `subscribeContact` in `packages/emailing`, which calls the Resend SDK.

**Unit** (`packages/emailing/tests/unit`, `apps/web/tests/unit`): the SDK is mocked with the response shapes it really returns. The SDK does not throw on API errors; it resolves `{ data: null, error }`.

**The fake** (`packages/emailing/testing/fake-resend`): owned by the package that wraps Resend and exported as `@workspace/emailing/testing/fake-resend`. `startFakeResend()` runs it in-process; `serve.ts` runs it as a process for apps. It implements only the endpoints we use, records every request (`GET /__fake/requests?email=`), and scripts failures by address prefix (`outage-` gives a 500, `duplicate-` gives a 409 "already exists"). Behaviour lives in the address, not in shared state, so tests run in parallel.

**Integration** (`packages/emailing/tests/integration`): `subscribeContact` with the real SDK against the fake, started by a Vitest `globalSetup` on a fixed port because the SDK reads `RESEND_BASE_URL` when its module loads. Asserts the request Resend would receive and the adapter's answer for success, duplicate, and outage.

**End-to-end** (`apps/web/tests/e2e/subscribe.spec.ts`):

- `wrangler.jsonc` declares a Cloudflare environment `e2e`, selected with `CLOUDFLARE_ENV=e2e`. It sets one var, `RESEND_BASE_URL`, which the SDK reads from `process.env`, and it is never deployed (`routes: []`).
- `apps/web/.dev.vars.e2e` holds dummy secrets and is committed. Wrangler loads `.dev.vars.<env>` before `.dev.vars`, so the e2e Worker cannot pick up real credentials.
- `playwright.config.ts` starts the fake (`pnpm --filter @workspace/emailing fake-resend`), then runs `CLOUDFLARE_ENV=e2e pnpm build && pnpm preview`. The preview is never reused.
- Tests assert on the UI and on what Resend would have received: path, bearer token, normalised address.

**Contract** (`packages/emailing/tests/contract/resend.test.ts`): runs `subscribeContact` against Resend with a unique address in a dedicated audience, checks the contact exists, checks a repeat still reports success, removes the contact. Needs `RESEND_API_KEY` and `RESEND_CONTRACT_AUDIENCE_ID`; skips without them.

**What it caught.** The adapter only handled thrown errors, so any Resend failure reported "Thanks for subscribing!". The unit tests had mocked a rejection the SDK never produces. The fake, sitting at the HTTP boundary, exercised the SDK's real behaviour and the outage test failed. The integration layer now catches this class of bug in the package itself, without a browser.

## Adding a new integration

In the package that wraps the vendor:

1. Put the adapter there, reading the vendor's base URL from a var with the production URL as the default. Most SDKs already support this; otherwise pass it explicitly.
2. Write the fake under `testing/fake-<vendor>/`: the endpoints we use, request recording, scripted failures, a `start` function and a `serve.ts`. Export it from the package.
3. Declare the layers in `vitest.config.ts` with `unit()`, `integration()`, `contract()` from `@workspace/testing/vitest.<layer>`, and write `tests/unit`, `tests/integration` (real SDK against the fake, started by `globalSetup`), and `tests/contract` (real API, cleans up). Add the contract secrets to the `contract` workflow.

In the app that uses it:

4. Add the base-URL var to `env.e2e` in `wrangler.jsonc`, pointing at the fake, and dummy secrets to `.dev.vars.e2e`.
5. Register the fake's `serve` script as a Playwright `webServer` and write e2e tests that assert both the UI and the recorded requests.

## Layout

Every package keeps its tests under `tests/`, one folder per layer: `tests/unit`, `tests/integration`, `tests/contract`, and `tests/e2e` (apps only). `@workspace/testing` defines each layer in its own file: `unit()` from `@workspace/testing/vitest.unit`, `integration()` from `@workspace/testing/vitest.integration`, and `contract()` from `@workspace/testing/vitest.contract` are Vitest projects that look in the matching folder and inherit the package's root config; `e2e` from `@workspace/testing/playwright.e2e` holds the Playwright defaults. Cloudflare Workers use `workers()` from `@workspace/testing/vitest.workers` for their unit layer: same folder and name, but the tests run inside workerd through `@cloudflare/vitest-pool-workers` with the local bindings of a `wrangler.test.jsonc` (KV, Durable Objects; never remote services). A package's `vitest.config.ts` only lists the layers it has; a layer is selected by name (`vitest --project contract`), never by filename suffix. Fakes live in `testing/` of the package that wraps the vendor. Tests import sources through the package's `@/` alias, declared once in its tsconfig `paths`; the shared layers turn those paths into Vite aliases, so no test walks up with `../../`.

## What we do not do

- No `.only` or `.skip` on committed tests, other than a contract test skipping when unconfigured.
- No shared mutable state between parallel tests. Encode behaviour in the input.
- No mocking of our own code in e2e tests. The only allowed interception on our side is Playwright routing the browser's request to the server function, to simulate transport failure.
- No secrets from `.env` files. Local secrets live in `.dev.vars` (Wrangler also reads `.env*` and the shell when required secrets are declared; a stray `.env.local` once fed real Resend keys to the e2e suite).
