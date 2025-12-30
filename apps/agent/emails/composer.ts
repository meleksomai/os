import { createMimeMessage } from "mimetext";
import { type Message, type NotificationOptions } from "../types";

/**
 * Email composer implementation using mimetext
 */
export class EmailComposer {
  /**
   * Compose a reply email as raw MIME
   */
  async composeReply(
    message: Message,
    content: string,
    fromAddress: string
  ): Promise<string> {
    const mimeMessage = createMimeMessage();

    const subject = message.subject.startsWith("Re:")
      ? message.subject
      : `Re: ${message.subject}`;

    mimeMessage.setSender({
      name: "Email Routing Assistant",
      addr: fromAddress,
    });

    mimeMessage.setRecipient(message.from);
    mimeMessage.setSubject(subject);

    if (message.messageId) {
      mimeMessage.setHeader("In-Reply-To", message.messageId);
      mimeMessage.setHeader("References", message.messageId);
    }

    mimeMessage.addMessage({
      contentType: "text/html",
      data: content,
    });

    return mimeMessage.asRaw();
  }

  /**
   * Compose a notification email as raw MIME
   */
  async composeNotification(options: NotificationOptions): Promise<string> {
    const {
      fromAddress,
      toAddress,
      content,
      contentType = "text/plain",
      inReplyTo = null,
      senderName = "Melek Somai (AI Assistant)",
    } = options;

    const msg = createMimeMessage();

    if (inReplyTo) {
      msg.setHeader("In-Reply-To", inReplyTo);
    }

    msg.setSender({
      name: senderName,
      addr: fromAddress,
    });

    msg.setRecipient(toAddress);
    msg.setSubject("Email Routing Auto-reply");
    msg.addMessage({
      contentType,
      data: content,
    });

    return msg.asRaw();
  }
}
