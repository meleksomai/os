/**
 * Runs the fake Resend as a standalone process on FAKE_RESEND_PORT, for
 * end-to-end suites that need it reachable from another process (the
 * Worker under `vite preview`). `pnpm --filter @workspace/emailing fake-resend`.
 */
import { FAKE_RESEND_PORT, startFakeResend } from "./index.ts";

await startFakeResend({ port: FAKE_RESEND_PORT });
