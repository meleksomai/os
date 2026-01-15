import { Agent, type AgentEmail } from "agents";
import { LLMTool } from "./tools/llm";
import { EmailTool } from "./tools/resend";
import type { Memory } from "./types";
import { EmailParser } from "./utils/parser";

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
  private readonly llm: LLMTool;
  private readonly resend: EmailTool;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    // Initialize services upfront - simple and explicit
    this.parser = new EmailParser();
    this.llm = new LLMTool(env);
    this.resend = new EmailTool(this.env.RESEND_API_KEY);
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
      return;
    }

    // Email from external sender - full workflow
    await this.handleExternalEmail(email);
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
      context: `${this.state.context}\n\n${msg.raw}`,
    });

    console.log("Owner email stored in context.");
  }

  /**
   * Handle emails from external senders
   * Full workflow: parse, classify, reply if needed, notify, forward
   */
  private async handleExternalEmail(email: AgentEmail): Promise<void> {
    console.log("Email from external sender. Handling accordingly.");
    // Parse and store message
    const msg = await this.parser.parse(email);
    console.log("Storing email message in agent memory.");

    this.setState({
      ...this.state,
      lastUpdated: new Date(),
      messages: [...this.state.messages, msg],
    });

    // Classify the email using AI
    console.log("Classifying email content using our AI model...");
    const classification = await this.llm.classifyEmail(this.state);
    console.log("Email classification:", classification);

    // Send reply if AI recommends it
    if (classification.action === "reply") {
      console.log("AI recommends replying to the email. Drafting reply...");
      const content = await this.llm.generateReplyDraft(this.state);

      console.log("Sending reply via Resend service...");
      await this.resend.sendReply(msg, content, this.env.EMAIL_ROUTING_ADDRESS);
    } else {
      console.log(
        `No reply action needed as per classification (${classification.action}).`
      );
    }

    // Forward to owner for record-keeping
    console.log("Forwarding email to self for record-keeping...");
    await email.forward(this.env.EMAIL_ROUTING_DESTINATION);
    console.log("Email processing completed.");
  }
}
