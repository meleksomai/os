import { beforeEach, describe, expect, it, vi } from "vitest";
import { createThreadBasedEmailResolver } from "./resolvers";

describe("createThreadBasedEmailResolver", () => {
  const AGENT_NAME = "TestAgent";
  const OWNER_EMAIL = "owner@example.com";
  const EXTERNAL_EMAIL = "friend@example.com";
  const THREAD_ID = "<thread-123@example.com>";

  let mockKV: KVNamespace;

  beforeEach(() => {
    // Create a fresh mock KV namespace for each test
    mockKV = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      getWithMetadata: vi.fn(),
    } as unknown as KVNamespace;
  });

  describe("new thread from external sender", () => {
    it("should create KV mapping and route to external sender", async () => {
      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: EXTERNAL_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": THREAD_ID,
        }),
      } as ForwardableEmailMessage;

      const result = await resolver(email, {} as any);

      // Should store the mapping in KV
      expect(mockKV.put).toHaveBeenCalledWith(
        THREAD_ID,
        EXTERNAL_EMAIL,
        expect.objectContaining({
          expirationTtl: 60 * 60 * 24 * 90, // 90 days
        })
      );

      // Should route to external sender
      expect(result).toEqual({
        agentName: AGENT_NAME,
        agentId: EXTERNAL_EMAIL,
      });
    });

    it("should normalize email addresses to lowercase", async () => {
      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: "Friend@Example.COM",
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": THREAD_ID,
        }),
      } as ForwardableEmailMessage;

      const result = await resolver(email, {} as any);

      // Should store lowercase email
      expect(mockKV.put).toHaveBeenCalledWith(
        THREAD_ID,
        "friend@example.com",
        expect.any(Object)
      );

      expect(result?.agentId).toBe("friend@example.com");
    });
  });

  describe("reply in existing thread", () => {
    it("should lookup thread in KV and route to original sender", async () => {
      // Mock KV to return the original sender
      (mockKV.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        EXTERNAL_EMAIL
      );

      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: OWNER_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": "<reply-1@example.com>",
          "In-Reply-To": THREAD_ID,
          References: THREAD_ID,
        }),
      } as ForwardableEmailMessage;

      const result = await resolver(email, {} as any);

      // Should lookup the thread
      expect(mockKV.get).toHaveBeenCalledWith(THREAD_ID);

      // Should NOT create a new mapping
      expect(mockKV.put).not.toHaveBeenCalled();

      // Should route to original sender
      expect(result).toEqual({
        agentName: AGENT_NAME,
        agentId: EXTERNAL_EMAIL,
      });
    });

    it("should use References header to find root thread if In-Reply-To is missing", async () => {
      const ROOT_THREAD = "<root@example.com>";
      const REPLY_1 = "<reply-1@example.com>";
      const REPLY_2 = "<reply-2@example.com>";

      (mockKV.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        EXTERNAL_EMAIL
      );

      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: OWNER_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": REPLY_2,
          "In-Reply-To": REPLY_1,
          References: `${ROOT_THREAD} ${REPLY_1}`,
        }),
      } as ForwardableEmailMessage;

      const result = await resolver(email, {} as any);

      // Should lookup using the ROOT thread ID (first in References)
      expect(mockKV.get).toHaveBeenCalledWith(ROOT_THREAD);

      expect(result?.agentId).toBe(EXTERNAL_EMAIL);
    });
  });

  describe("owner private messages", () => {
    it("should route owner's private message to correct thread", async () => {
      // Owner sends private note to AI in existing thread
      (mockKV.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        EXTERNAL_EMAIL
      );

      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: OWNER_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": "<private-note@example.com>",
          "In-Reply-To": THREAD_ID,
          References: THREAD_ID,
        }),
      } as ForwardableEmailMessage;

      const result = await resolver(email, {} as any);

      // Should route to the external person's thread
      expect(result).toEqual({
        agentName: AGENT_NAME,
        agentId: EXTERNAL_EMAIL,
      });
    });
  });

  describe("thread not found in KV", () => {
    it("should treat as new thread if not found in KV", async () => {
      // Mock KV to return null (thread not found)
      (mockKV.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: EXTERNAL_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": "<new-message@example.com>",
          "In-Reply-To": THREAD_ID,
          References: THREAD_ID,
        }),
      } as ForwardableEmailMessage;

      const result = await resolver(email, {} as any);

      // Should lookup first
      expect(mockKV.get).toHaveBeenCalled();

      // Should create new mapping using the root thread ID
      expect(mockKV.put).toHaveBeenCalledWith(
        THREAD_ID,
        EXTERNAL_EMAIL,
        expect.objectContaining({
          expirationTtl: 60 * 60 * 24 * 90, // 90 days
        })
      );

      expect(result?.agentId).toBe(EXTERNAL_EMAIL);
    });
  });

  describe("missing thread ID", () => {
    it("should fallback to sender-based routing if no Message-ID", async () => {
      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: EXTERNAL_EMAIL,
        to: "hello@example.com",
        headers: new Headers({}), // No Message-ID
      } as ForwardableEmailMessage;

      const result = await resolver(email, {} as any);

      // Should not interact with KV
      expect(mockKV.get).not.toHaveBeenCalled();
      expect(mockKV.put).not.toHaveBeenCalled();

      // Should fallback to routing by sender
      expect(result).toEqual({
        agentName: AGENT_NAME,
        agentId: EXTERNAL_EMAIL,
      });
    });
  });

  describe("owner initiates thread", () => {
    it("should handle owner sending initial email", async () => {
      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: OWNER_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": THREAD_ID,
        }),
      } as ForwardableEmailMessage;

      const result = await resolver(email, {} as any);

      // Should create mapping with "unknown" as external person
      expect(mockKV.put).toHaveBeenCalledWith(
        THREAD_ID,
        OWNER_EMAIL,
        expect.objectContaining({
          expirationTtl: 60 * 60 * 24 * 90, // 90 days
        })
      );

      expect(result).toEqual({
        agentName: AGENT_NAME,
        agentId: OWNER_EMAIL,
      });
    });
  });

  describe("conversation isolation", () => {
    it("should keep separate threads isolated", async () => {
      const ALICE = "alice@example.com";
      const BOB = "bob@example.com";
      const THREAD_A = "<thread-a@example.com>";
      const THREAD_B = "<thread-b@example.com>";

      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      // Alice's email
      const emailFromAlice = {
        from: ALICE,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": THREAD_A,
        }),
      } as ForwardableEmailMessage;

      const resultAlice = await resolver(emailFromAlice, {} as any);

      expect(mockKV.put).toHaveBeenCalledWith(
        THREAD_A,
        ALICE,
        expect.any(Object)
      );
      expect(resultAlice?.agentId).toBe(ALICE);

      // Bob's email (different thread)
      const emailFromBob = {
        from: BOB,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": THREAD_B,
        }),
      } as ForwardableEmailMessage;

      const resultBob = await resolver(emailFromBob, {} as any);

      expect(mockKV.put).toHaveBeenCalledWith(
        THREAD_B,
        BOB,
        expect.objectContaining({
          expirationTtl: 60 * 60 * 24 * 90, // 90 days
        })
      );
      expect(resultBob?.agentId).toBe(BOB);

      // Should have created two separate mappings
      expect(mockKV.put).toHaveBeenCalledTimes(2);
    });
  });

  describe("edge cases", () => {
    it("should handle References with comma separators", async () => {
      const ROOT = "<root@example.com>";
      (mockKV.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        EXTERNAL_EMAIL
      );

      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: OWNER_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": "<reply@example.com>",
          References: `${ROOT}, <other@example.com>`, // Comma-separated
        }),
      } as ForwardableEmailMessage;

      await resolver(email, {} as any);

      // Should correctly parse the first reference
      expect(mockKV.get).toHaveBeenCalledWith(ROOT);
    });

    it("should handle References with extra whitespace", async () => {
      const ROOT = "<root@example.com>";
      (mockKV.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        EXTERNAL_EMAIL
      );

      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: OWNER_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": "<reply@example.com>",
          References: `  ${ROOT}   <other@example.com>  `, // Extra spaces
        }),
      } as ForwardableEmailMessage;

      await resolver(email, {} as any);

      expect(mockKV.get).toHaveBeenCalledWith(ROOT);
    });

    it("should prefer References over In-Reply-To for thread root", async () => {
      const ROOT = "<root@example.com>";
      const PARENT = "<parent@example.com>";

      (mockKV.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        EXTERNAL_EMAIL
      );

      const resolver = createThreadBasedEmailResolver(AGENT_NAME, mockKV);

      const email = {
        from: OWNER_EMAIL,
        to: "hello@example.com",
        headers: new Headers({
          "Message-ID": "<reply@example.com>",
          "In-Reply-To": PARENT,
          References: `${ROOT} ${PARENT}`,
        }),
      } as ForwardableEmailMessage;

      await resolver(email, {} as any);

      // Should use ROOT from References, not PARENT from In-Reply-To
      expect(mockKV.get).toHaveBeenCalledWith(ROOT);
    });
  });
});
