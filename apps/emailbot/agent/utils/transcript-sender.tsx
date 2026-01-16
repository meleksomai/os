import GenericEmail from "@workspace/transactional/emails/generic";
import { Resend } from "resend";
import type { Memory } from "../types";
import { getTranscript, log } from "./logger";

const TRANSCRIPT_FOOTER =
  "This is an automated transcript from your AI email assistant. [Learn more](https://github.com/meleksomai/os)";

interface TranscriptEmailOptions {
  originalFrom: string;
  originalSubject: string;
  state: Memory;
}

/**
 * Send the agent activity transcript to the owner
 */
export async function sendTranscript(
  env: Env,
  options: TranscriptEmailOptions
): Promise<void> {
  const transcript = getTranscript();

  if (transcript === "No activity recorded.") {
    log.debug("transcript skipped", { reason: "no activity" });
    return;
  }

  const subject = `[Agent Log] Re: ${options.originalSubject}`;

  const { state } = options;

  const content = `# Email Processing Transcript

**Original email from:** ${options.originalFrom}
**Subject:** ${options.originalSubject}
**Processed at:** ${new Date().toISOString()}

---

## Agent Activity

${transcript}

---

## State

**Contact:** ${state.contact || "not set"}
**Messages:** ${state.messages.length}
**Last Updated:** ${state.lastUpdated || "never"}

### Context

${state.context || "empty"}

*This transcript shows what your AI assistant did when processing the email above.*
`;

  try {
    const resend = new Resend(env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_ROUTING_ADDRESS,
      to: env.EMAIL_ROUTING_DESTINATION,
      subject,
      react: (
        <GenericEmail
          content={content}
          footer={TRANSCRIPT_FOOTER}
          previewMessage={`Agent processed email from ${options.originalFrom}`}
        />
      ),
    });

    if (error) {
      log.error("transcript failed", { error: error.message });
      return;
    }

    log.info("transcript sent", { emailId: data?.id });
  } catch (err) {
    log.error("transcript failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
