import { describe, expect, it, vi } from "vitest";
import { MemoryManager } from "../../memory-manager";
import type { Memory, Message } from "../../types";
import { createMockMemory, createMockMessage } from "../helper";

describe("MemoryManager", () => {
  it("should get current state", () => {
    const mockMemory = createMockMemory({
      context: "test context",
      messages: [],
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);

    const state = manager.getState();

    expect(state).toEqual(mockMemory);
    expect(getStateFn).toHaveBeenCalled();
  });

  it("should store message and update lastUpdated", async () => {
    const mockMemory = createMockMemory({
      lastUpdated: null,
      messages: [],
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);
    const message = createMockMessage({
      from: "test@example.com",
      subject: "Test Message",
    });

    await manager.storeMessage(message);

    expect(setStateFn).toHaveBeenCalled();
    const newState = setStateFn.mock.calls[0]?.[0] as Memory;
    expect(newState.messages).toHaveLength(1);
    expect(newState.messages[0]).toEqual(message);
    expect(newState.lastUpdated).toBeInstanceOf(Date);
  });

  it("should append messages to existing array", async () => {
    const existingMessage = createMockMessage({
      from: "existing@example.com",
    });
    const mockMemory = createMockMemory({
      messages: [existingMessage],
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);
    const newMessage = createMockMessage({ from: "new@example.com" });

    await manager.storeMessage(newMessage);

    const newState = setStateFn.mock.calls[0]?.[0] as Memory;
    expect(newState.messages).toHaveLength(2);
    expect(newState.messages[0]).toEqual(existingMessage);
    expect(newState.messages[1]).toEqual(newMessage);
  });

  it("should append context and update lastUpdated", async () => {
    const mockMemory = createMockMemory({
      context: "existing context",
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);

    await manager.appendContext("new context content");

    const newState = setStateFn.mock.calls[0]?.[0] as Memory;
    expect(newState.context).toContain("existing context");
    expect(newState.context).toContain("new context content");
    expect(newState.lastUpdated).toBeInstanceOf(Date);
  });

  it("should append context with double newlines", async () => {
    const mockMemory = createMockMemory({
      context: "first line",
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);

    await manager.appendContext("second line");

    const newState = setStateFn.mock.calls[0]?.[0] as Memory;
    expect(newState.context).toBe("first line\n\nsecond line");
  });

  it("should update state with partial updates", async () => {
    const mockMemory = createMockMemory({
      context: "original context",
      summary: "original summary",
      messages: [],
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);

    await manager.updateState({ summary: "updated summary" });

    const newState = setStateFn.mock.calls[0]?.[0] as Memory;
    expect(newState.context).toBe("original context");
    expect(newState.summary).toBe("updated summary");
    expect(newState.lastUpdated).toBeInstanceOf(Date);
  });

  it("should maintain immutability of original state", async () => {
    const mockMemory = createMockMemory({
      messages: [createMockMessage()],
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);
    const newMessage = createMockMessage({ from: "new@example.com" });

    await manager.storeMessage(newMessage);

    // Original state should remain unchanged
    expect(mockMemory.messages).toHaveLength(1);
    expect(mockMemory.messages[0]?.from).not.toBe("new@example.com");
  });

  it("should validate state with Zod schema", async () => {
    const mockMemory = createMockMemory();
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);
    const message = createMockMessage();

    // Should not throw validation error
    await expect(manager.storeMessage(message)).resolves.not.toThrow();
  });

  it("should update lastUpdated on every state change", async () => {
    const mockMemory = createMockMemory({
      lastUpdated: new Date("2024-01-01"),
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);

    await manager.updateState({ summary: "test" });

    const newState = setStateFn.mock.calls[0]?.[0] as Memory;
    expect(newState.lastUpdated?.getTime()).toBeGreaterThan(
      new Date("2024-01-01").getTime()
    );
  });

  it("should preserve all fields when storing message", async () => {
    const mockMemory = createMockMemory({
      context: "preserved context",
      summary: "preserved summary",
      messages: [],
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);
    const message = createMockMessage();

    await manager.storeMessage(message);

    const newState = setStateFn.mock.calls[0]?.[0] as Memory;
    expect(newState.context).toBe("preserved context");
    expect(newState.summary).toBe("preserved summary");
  });

  it("should preserve all fields when appending context", async () => {
    const existingMessage = createMockMessage();
    const mockMemory = createMockMemory({
      messages: [existingMessage],
      summary: "preserved summary",
    });
    const getStateFn = vi.fn(() => mockMemory);
    const setStateFn = vi.fn();

    const manager = new MemoryManager(getStateFn, setStateFn);

    await manager.appendContext("new context");

    const newState = setStateFn.mock.calls[0]?.[0] as Memory;
    expect(newState.messages).toEqual([existingMessage]);
    expect(newState.summary).toBe("preserved summary");
  });
});
