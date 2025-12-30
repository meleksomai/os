import { EmailMessage } from "cloudflare:email";
import { Agent, type AgentEmail } from "agents";
import { EmailComposer } from "./emails/composer";
import { EmailParser } from "./emails/parser";
import { LLMService } from "./llm-service";
import { MemoryManager } from "./memory-manager";
import {
  type EmailClassification,
  type Memory,
  type Message,
  type SenderType,
} from "./types";

export class HelloEmailAgent extends Agent<Env, Memory> {
  initialState: Memory = {
    lastUpdated: null,
    messages: [],
    context: "",
    summary: "",
  };

  // Services (initialized lazily in production, can be injected in tests)
  private emailParser?: EmailParser;
  private memoryManager?: MemoryManager;
  private llmService?: LLMService;
  private emailComposer?: EmailComposer;

  /**
   * Main entry point for handling incoming emails
   */
  async _onEmail(email: AgentEmail): Promise<void> {
    const triage = this.triageEmail(email);

    switch (triage) {
      case "agent":
        console.log("Email from self-agent. Ignoring to prevent loops.");
        return;

      case "self":
        console.log("Email from owner. Storing as context.");
        await this.handleOwnerEmail(email);
        return;

      case "external":
        console.log("Email from external sender. Handling accordingly.");
        await this.handleExternalEmail(email);
        return;

      default:
        console.log("Unknown sender type. Ignoring email.");
        return;
    }
  }

  /**
   * Handle emails from owner
   * Simple: store as context for now
   * TODO: Add tool-based agentic approach
   */
  private async handleOwnerEmail(email: AgentEmail): Promise<void> {
    const parser = this.getEmailParser();
    const memory = this.getMemoryManager();

    const msg = await parser.parse(email);
    console.log("Storing owner email as context.");
    await memory.appendContext(msg.raw);
    console.log("Owner email stored in context.");
  }

  /**
   * Handle emails from external senders
   */
  private async handleExternalEmail(email: AgentEmail): Promise<void> {
    const parser = this.getEmailParser();
    const memory = this.getMemoryManager();
    const llm = this.getLLMService();
    const composer = this.getEmailComposer();

    // Parse and store
    const msg = await parser.parse(email);
    console.log("Storing email message in agent memory.");
    await memory.storeMessage(msg);

    // Classify
    console.log("Classifying email content using our AI model...");
    const context = memory.getState().context;
    const classification = await llm.classifyEmail(msg, context);
    console.log("Email classification:", classification);

    // Reply if needed
    if (classification.action === "reply") {
      const replyContent = await llm.generateReplyDraft(msg, context);
      const reply = await composer.composeReply(
        msg,
        replyContent,
        this.env.EMAIL_ROUTING_ADDRESS
      );

      console.log("Sending reply email...");
      await email.reply({
        from: this.env.EMAIL_ROUTING_ADDRESS,
        raw: reply,
        to: msg.from,
      });
    }

    // Forward
    console.log("Forwarding email to self for record-keeping.");
    await email.forward(this.env.EMAIL_ROUTING_DESTINATION);

    // Notify
    await this.notifySelfByEmail(email, msg, classification, composer);
    console.log("Email processing completed.");
  }

  /**
   * Triage email based on sender
   */
  private triageEmail(email: AgentEmail): SenderType {
    const from = email.from.toLowerCase();

    // Simple triage rules
    // 1. If the email is from me (likely a response), mark as self
    if (from === this.env.EMAIL_ROUTING_DESTINATION.toLowerCase()) {
      return "self";
    }

    // 2. If the email is from the routing address, mark as agent (agent replying to the thread)
    if (from === this.env.EMAIL_ROUTING_ADDRESS.toLowerCase()) {
      return "agent";
    }

    // 3. Otherwise, mark as external
    return "external";
  }

  /**
   * Send notification email to self with summary
   */
  private async notifySelfByEmail(
    original: AgentEmail,
    msg: Message,
    classification: EmailClassification,
    composer: EmailComposer
  ): Promise<void> {
    console.log("Notifying self by email with summary...");

    const content = `Received an email from ${msg.from} with subject "${msg.subject}".\n\nClassified action: ${classification.action}.\n\nComments: ${classification.comments}\n\nContext:\n${this.getMemoryManager().getState().context}`;

    const notificationRaw = await composer.composeNotification({
      fromAddress: this.env.EMAIL_ROUTING_ADDRESS,
      toAddress: this.env.EMAIL_ROUTING_DESTINATION,
      content,
      contentType: "text/plain",
      inReplyTo: original.headers.get("Message-ID"),
      senderName: "Email Routing Assistant",
    });

    const emailMessage = new EmailMessage(
      this.env.EMAIL_ROUTING_ADDRESS,
      this.env.EMAIL_ROUTING_DESTINATION,
      notificationRaw
    );

    console.log(
      "Sending email notification to self:",
      this.env.EMAIL_ROUTING_DESTINATION
    );
    await this.env.SEB.send(emailMessage);
    console.log("Notification email sent to self.");
  }

  // Services

  /**
   * Get email parser instance (lazy initialization)
   */
  private getEmailParser(): EmailParser {
    if (!this.emailParser) {
      this.emailParser = new EmailParser();
    }
    return this.emailParser;
  }

  /**
   * Get memory manager instance (lazy initialization)
   */
  private getMemoryManager(): MemoryManager {
    if (!this.memoryManager) {
      this.memoryManager = new MemoryManager(
        () => this.state,
        (state: Memory) => {
          this.setState(state);
          return Promise.resolve();
        }
      );
    }
    return this.memoryManager;
  }

  /**
   * Get LLM service instance (lazy initialization)
   */
  private getLLMService(): LLMService {
    if (!this.llmService) {
      this.llmService = new LLMService();
    }
    return this.llmService;
  }

  /**
   * Get email composer instance (lazy initialization)
   */
  private getEmailComposer(): EmailComposer {
    if (!this.emailComposer) {
      this.emailComposer = new EmailComposer();
    }
    return this.emailComposer;
  }
}
