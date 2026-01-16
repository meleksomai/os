import { Agent, type AgentEmail } from "agents";
import type { Memory } from "./types";
import { clearTranscript, log } from "./utils/logger";
import { EmailParser } from "./utils/parser";
import { sendTranscript } from "./utils/transcript-sender";
import { createOwnerResponseAgent } from "./workflows/owner-loop-agent";
import { createReplyContactAgent } from "./workflows/reply-contact-workflow";

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
   * Apply state updates atomically
   * Single source of truth - only this method mutates state
   */
  private applyUpdates(updates: Partial<Memory> | undefined): void {
    if (!updates) return;
    this.setState({ ...this.state, ...updates });
    log.debug("[agent] state updated", { keys: Object.keys(updates) });
  }

  /**
   * TEMPORARY: Migrate old instances that don't have contact set.
   * Extracts contact from first external message in state.
   * TODO: Remove after all instances are migrated.
   */
  private migrateContact(): void {
    if (this.state.contact) return;
    if (this.state.messages.length === 0) return;

    const owner = this.env.EMAIL_ROUTING_DESTINATION.toLowerCase();
    const routing = this.env.EMAIL_ROUTING_ADDRESS.toLowerCase();

    // Find first message from external sender
    const externalMessage = this.state.messages.find((msg) => {
      const from = msg.from.toLowerCase();
      return from !== owner && from !== routing;
    });

    if (externalMessage) {
      log.info("[agent] migrating contact", { contact: externalMessage.from });
      this.setState({
        ...this.state,
        contact: externalMessage.from,
      });
    }
  }

  /**
   * Main entry point for handling incoming emails
   */
  async _onEmail(email: AgentEmail): Promise<void> {
    clearTranscript();

    // Migrate old instances
    this.migrateContact();

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

    // Add message to state
    this.applyUpdates({
      lastUpdated: new Date().toISOString(),
      messages: [...this.state.messages, msg],
    });

    const agent = await createOwnerResponseAgent(this.env, this.state);
    const result = await agent.execute({
      prompt: `New email from owner:\n\nFrom: ${msg.from}\nSubject: ${msg.subject}\n\nContent:\n${msg.raw}`,
    });

    // Apply any state updates proposed by the agent
    this.applyUpdates(result.stateUpdates);

    log.info("[owner-workflow] ended", { durationMs: Date.now() - startTime });
  }

  /**
   * Handle emails from external senders
   */
  private async handleIncomingEmail(email: AgentEmail): Promise<void> {
    const startTime = Date.now();
    log.info("[reply-workflow] started");

    const msg = await this.parser.parse(email);

    // Add message to state, set contact if not already set
    this.applyUpdates({
      lastUpdated: new Date().toISOString(),
      messages: [...this.state.messages, msg],
      contact: this.state.contact ?? msg.from,
    });

    const agent = createReplyContactAgent(this.env, this.state);
    const result = await agent.execute();

    // Apply any state updates proposed by the agent
    this.applyUpdates(result.stateUpdates);

    log.info("[reply-workflow] ended", {
      durationMs: Date.now() - startTime,
      action: result.output.action,
    });
  }
}
