import { Agent, type AgentEmail } from "agents";
import { generateText } from "ai";
import { getContextTools, getEmailTools } from "./tools";
import type { Memory } from "./types";
import { retrieveModel } from "./utils/model-provider";
import { EmailParser } from "./utils/parser";
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

    // Route based on sender
    if (from === routing) {
      // Email from our own routing address - ignore to prevent loops
      console.log("Email from self-agent. Ignoring to prevent loops.");
      return;
    }

    if (from === owner) {
      // Email from owner - store as context
      await this.handleOwnerEmail(email);
    } else {
      // Email from external sender - full workflow
      await this.handleIncomingEmail(email);
    }

    // Always forward to owner's address
    await email.forward(this.env.EMAIL_ROUTING_DESTINATION);
  }

  /**
   * Handle emails from owner - store as context
   */
  private async handleOwnerEmail(email: AgentEmail): Promise<void> {
    console.log("Email from owner. Storing as context.");
    const msg = await this.parser.parse(email);

    this.setState({
      ...this.state,
      lastUpdated: new Date(),
      messages: [...this.state.messages, msg],
    });

    // TO BE IMPLEMENTED: context update workflow
  }

  /**
   * Handle emails from external senders
   */
  private async handleIncomingEmail(email: AgentEmail): Promise<void> {
    // Parse and store message
    const msg = await this.parser.parse(email);
    console.log("Storing email message in agent memory.");

    this.setState({
      ...this.state,
      lastUpdated: new Date(),
      messages: [...this.state.messages, msg],
    });

    // Run reply-sender workflow
    console.log("Running reply-sender workflow.");
    const replyWorkflow = replySenderAgent(this.env, this.state);
    const result = await replyWorkflow.generate();

    // Update state if modified
    if (result?.state) {
      this.setState({
        ...this.state,
        ...result.state,
      });
    }
  }

  private model() {
    return retrieveModel(this.env);
  }
}
