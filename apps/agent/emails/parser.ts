import type { AgentEmail } from "agents";
import PostalMime from "postal-mime";
import { type IEmailParser, type Message, MessageSchema } from "../types";

/**
 * Email parser implementation using PostalMime
 */
export class EmailParser implements IEmailParser {
  private readonly parser: PostalMime;

  constructor() {
    this.parser = new PostalMime();
  }

  /**
   * Parse raw email into structured Message
   */
  async parse(email: AgentEmail): Promise<Message> {
    const rawEmail = await email.getRaw();
    const parsed = await this.parser.parse(rawEmail);

    const message: Message = {
      date: new Date(),
      from: email.from,
      subject: parsed.subject || "(No Subject)",
      raw: parsed.html || parsed.text || "",
      to: email.to,
      messageId: email.headers.get("Message-ID") || parsed.messageId || null,
    };

    // Validate with Zod schema to ensure type safety
    return MessageSchema.parse(message);
  }
}
