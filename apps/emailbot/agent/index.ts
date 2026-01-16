import { Agent, type AgentEmail } from "agents";
import type { Memory } from "./types";
import { log } from "./utils/logger";
import { EmailParser } from "./utils/parser";
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
    const from = email.from.toLowerCase();
    const owner = this.env.EMAIL_ROUTING_DESTINATION.toLowerCase();
    const routing = this.env.EMAIL_ROUTING_ADDRESS.toLowerCase();

    log.info("email.received", {
      from: email.from,
      to: email.to,
      subject: email.headers.get("Subject") || "(no subject)",
    });

    // Route based on sender
    if (from === routing) {
      log.warn("email.loop_prevented", { from: email.from });
      return;
    }

    const route = from === owner ? "owner" : "external";
    log.info("email.routing", { from: email.from, route });

    if (from === owner) {
      await this.handleOwnerEmail(email);
    } else {
      await this.handleIncomingEmail(email);
    }

    log.info("email.forwarded", { to: this.env.EMAIL_ROUTING_DESTINATION });
    await email.forward(this.env.EMAIL_ROUTING_DESTINATION);
  }

  /**
   * Handle emails from owner
   * Uses ToolLoopAgent to decide actions: update context, act on behalf, etc.
   */
  private async handleOwnerEmail(email: AgentEmail): Promise<void> {
    const startTime = Date.now();
    log.info("workflow.started", { workflow: "owner-response" });

    const msg = await this.parser.parse(email);

    // Store the message first
    this.setState({
      ...this.state,
      lastUpdated: new Date().toISOString(),
      messages: [...this.state.messages, msg],
    });

    log.debug("state.message_stored", {
      messageCount: this.state.messages.length,
    });

    // Run the owner response agent
    const agent = await createOwnerResponseAgent(this.env);
    const { text } = await agent.generate({
      prompt: `New email from owner:\n\nFrom: ${msg.from}\nSubject: ${msg.subject}\nContent:\n${msg.raw}`,
    });

    // Update state if modified
    this.setState({
      ...this.state,
      context: text.trim(),
    });

    log.info("workflow.completed", {
      workflow: "owner-response",
      durationMs: Date.now() - startTime,
      contextLength: text.trim().length,
    });
  }

  /**
   * Handle emails from external senders
   */
  private async handleIncomingEmail(email: AgentEmail): Promise<void> {
    const startTime = Date.now();
    log.info("workflow.started", { workflow: "reply-sender" });

    // Parse and store message
    const msg = await this.parser.parse(email);

    this.setState({
      ...this.state,
      lastUpdated: new Date().toISOString(),
      messages: [...this.state.messages, msg],
    });

    log.debug("state.message_stored", {
      messageCount: this.state.messages.length,
    });

    // Run reply-sender workflow
    const replyWorkflow = replySenderAgent(this.env, this.state);
    const result = await replyWorkflow.generate();

    // Update state if modified
    if (result?.state) {
      this.setState({
        ...this.state,
        ...result.state,
      });
    }

    log.info("workflow.completed", {
      workflow: "reply-sender",
      durationMs: Date.now() - startTime,
    });
  }
}
