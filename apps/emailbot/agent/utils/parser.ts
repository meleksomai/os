import type { AgentEmail } from "agents";
import PostalMime from "postal-mime";
import { type Message, MessageSchema } from "../types";

/**
 * Email parser implementation using PostalMime
 */
export class EmailParser {
  /**
   * Parse raw email into structured Message
   */
  async parse(email: AgentEmail): Promise<Message> {
    const rawEmail = await email.getRaw();

    // Create a new PostalMime instance for each parse
    // PostalMime parsers cannot be reused
    const parser = new PostalMime();
    const parsed = await parser.parse(rawEmail);

    // Extract CC recipients
    const cc: string[] = [];
    if (parsed.cc) {
      const ccList = Array.isArray(parsed.cc) ? parsed.cc : [parsed.cc];
      for (const recipient of ccList) {
        if (typeof recipient === "string") {
          cc.push(recipient);
        } else if (
          recipient &&
          typeof recipient === "object" &&
          "address" in recipient
        ) {
          cc.push(recipient.address!);
        }
      }
    }

    // Extract In-Reply-To header
    const inReplyTo =
      email.headers.get("In-Reply-To") || parsed.inReplyTo || null;

    // Extract References header
    const references: string[] = [];
    const referencesHeader =
      email.headers.get("References") || parsed.references;
    if (referencesHeader) {
      // References can be space or comma separated message IDs
      const refList = referencesHeader.split(/[\s,]+/).filter((r) => r.trim());
      references.push(...refList);
    }

    const message: Message = {
      date: new Date().toISOString(),
      from: email.from,
      subject: parsed.subject || "(No Subject)",
      raw: parsed.html || parsed.text || "",
      to: email.to,
      messageId: email.headers.get("Message-ID") || parsed.messageId || null,
      cc: cc.length > 0 ? cc : undefined,
      inReplyTo: inReplyTo || undefined,
      references: references.length > 0 ? references : undefined,
    };

    // Validate with Zod schema to ensure type safety
    return MessageSchema.parse(message);
  }
}
