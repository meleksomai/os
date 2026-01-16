import { Agent, type AgentEmail } from "agents";
import type { Memory } from "./types";
import { clearTranscript, log } from "./utils/logger";
import { EmailParser } from "./utils/parser";
import { sendTranscript } from "./utils/transcript-sender";
import { createOwnerResponseAgent } from "./workflows/owner-response-agent";
import { replySenderAgent } from "./workflows/reply-sender-workflow";

/**
 * HelloEmailAgent - AI-powered email routing assistant
 * Simple, educational architecture - easy to understand and extend
 */
export class HelloEmailAgent extends Agent<Env, Memory> {
  initialState: Memory = {
    lastUpdated: null,
    messages: [],
    context: "",
    summary: "",
    contact: null,
  };

  // Services - directly instantiated, no magic
  private readonly parser: EmailParser;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    // Initialize services upfront - simple and explicit
    this.parser = new EmailParser();
  }

  /**
   * Main entry point for handling incoming emails
   */
  async _onEmail(email: AgentEmail): Promise<void> {
    clearTranscript();

    const from = email.from.toLowerCase();
    const owner = this.env.EMAIL_ROUTING_DESTINATION.toLowerCase();
    const routing = this.env.EMAIL_ROUTING_ADDRESS.toLowerCase();
    const subject = email.headers.get("Subject") || "(no subject)";

    log.info("[agent] received", { from: email.from, to: email.to, subject });

    if (from === routing) {
      log.warn("[agent] loop prevented", { from: email.from });
      return;
    }

    const route = from === owner ? "owner" : "external";
    log.info("[agent] routing", { route });

    if (from === owner) {
      await this.handleOwnerEmail(email);
    } else {
      await this.handleIncomingEmail(email);
    }

    log.info("[agent] forwarded", { to: this.env.EMAIL_ROUTING_DESTINATION });
    await email.forward(this.env.EMAIL_ROUTING_DESTINATION);

    // Send transcript for external emails only
    await sendTranscript(this.env, {
      originalFrom: email.from,
      originalSubject: subject,
      state: this.state,
    });
  }

  /**
   * Handle emails from owner
   * Uses ToolLoopAgent to decide actions: update context, act on behalf, etc.
   */
  private async handleOwnerEmail(email: AgentEmail): Promise<void> {
    const startTime = Date.now();
    log.info("[owner-workflow] started");

    const msg = await this.parser.parse(email);

    this.setState({
      ...this.state,
      lastUpdated: new Date().toISOString(),
      messages: [...this.state.messages, msg],
    });

    const agent = await createOwnerResponseAgent(this.env, this.state);
    const { text } = await agent.generate({
      prompt: `New email from owner:\n\nFrom: ${msg.from}\nSubject: ${msg.subject}\n\nContent:\n${msg.raw}`,
    });

    this.setState({
      ...this.state,
      context: text.trim(),
    });

    log.info("[owner-workflow] ended", { durationMs: Date.now() - startTime });
  }

  /**
   * Handle emails from external senders
   */
  private async handleIncomingEmail(email: AgentEmail): Promise<void> {
    const startTime = Date.now();
    log.info("[reply-workflow] started");

    const msg = await this.parser.parse(email);

    // Set contact if not already set (handles first message and migration of existing instances)
    if (!this.state.contact) {
      log.info("[reply-workflow] setting contact", { contact: msg.from });
      this.setState({
        ...this.state,
        contact: msg.from,
      });
    }

    this.setState({
      ...this.state,
      lastUpdated: new Date().toISOString(),
      messages: [...this.state.messages, msg],
    });

    const replyWorkflow = replySenderAgent(this.env, this.state);
    const result = await replyWorkflow.generate();

    if (result?.state) {
      this.setState({
        ...this.state,
        ...result.state,
      });
    }

    log.info("[reply-workflow] ended", { durationMs: Date.now() - startTime });
  }
}
