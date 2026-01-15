import { Agent, type AgentEmail } from "agents";
import { generateText } from "ai";
import { getContextTools, getEmailTools } from "./tools";
import type { Memory } from "./types";
import { retrieveModel } from "./utils/model-provider";
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
      return;
    }

    // Email from external sender - full workflow
    await this.handleIncomingEmail(email);
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

    const currentState = this.state;
    const updateState = this.setState.bind(this);

    const result = await generateText({
      model: await this.model(),
      prompt: "",
      tools: getContextTools(this.env),
      onStepFinish({ toolResults }) {
        for (const toolResult of toolResults) {
          if (toolResult.dynamic) {
            // Ignore dynamic tool results
            continue;
          }
          switch (toolResult.toolName) {
            case "updateContext":
              const updatedContext = toolResult.output.context;
              console.log("Updated context:", updatedContext);
              updateState({
                ...currentState,
                lastUpdated: new Date(),
                context: updatedContext,
              });
              break;
          }
        }
      },
    });
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

    const currentState = this.state;
    const updateState = this.setState.bind(this);

    const { steps } = await generateText({
      model: await this.model(),
      prompt: "",
      tools: getEmailTools(this.env),
      onStepFinish: async ({ toolResults }) => {
        for (const toolResult of toolResults) {
          if (toolResult.dynamic) {
            // Ignore dynamic tool results
            continue;
          }
          switch (toolResult.toolName) {
            case "sendEmail":
              // updateState({
              //   ...currentState,
              //   lastUpdated: new Date(),
              //   messages: [...currentState.messages],
              // });
              break;
          }
        }
      },
    });
  }

  private model() {
    return retrieveModel(this.env);
  }
}
