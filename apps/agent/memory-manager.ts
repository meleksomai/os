import { type Memory, type Message } from "./types";

/**
 * Memory manager implementation for Durable Objects state
 */
export class MemoryManager {
  constructor(
    private readonly getStateFn: () => Memory,
    private readonly setStateFn: (state: Memory) => Promise<void>
  ) {}

  /**
   * Get current agent state
   */
  getState(): Memory {
    return this.getStateFn();
  }

  /**
   * Store a message in agent memory
   */
  async storeMessage(message: Message): Promise<void> {
    const currentState = this.getState();
    const newState: Memory = {
      ...currentState,
      lastUpdated: new Date(),
      messages: [...currentState.messages, message],
    };

    await this.setStateFn(newState);
  }

  /**
   * Store a message as context (for internal emails)
   */
  async appendContext(update: string | Uint8Array): Promise<void> {
    const currentState = this.getState();
    const updateStr =
      typeof update === "string" ? update : new TextDecoder().decode(update);
    const newState: Memory = {
      ...currentState,
      lastUpdated: new Date(),
      context: currentState.context
        ? `${currentState.context}\n\n${updateStr}`
        : updateStr,
    };

    await this.setStateFn(newState);
  }

  /**
   * Update agent state with partial updates
   */
  async updateState(updates: Partial<Memory>): Promise<void> {
    const currentState = this.getState();
    const newState: Memory = {
      ...currentState,
      ...updates,
      lastUpdated: new Date(),
    };

    await this.setStateFn(newState);
  }
}
