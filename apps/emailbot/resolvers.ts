import type { EmailResolver } from "agents";

/**
 * Thread-Based Email Resolver
 *
 * Routes emails based on conversation threads, ensuring all emails in a thread
 * route to the same Durable Object instance regardless of sender.
 *
 * This maintains conversation context even when:
 * - External person sends initial email
 * - Owner replies to external person within the same thread
 * - Owner sends private notes to AI assistant within a thread
 *
 * Uses KV to map thread IDs to the external person's email address.
 *
 * @param agentName - The name of the Durable Object class
 * @param ownerEmail - The owner's email address to distinguish from external senders
 * @param store - KV namespace for storing thread-to-person mappings
 * @returns EmailResolver function
 */
export function createThreadBasedEmailResolver<Env>(
  agentName: string,
  store: KVNamespace
): EmailResolver<Env> {
  return async (email: ForwardableEmailMessage, _env: Env) => {
    // Determine the thread ID (use first message in thread)

    const state = await evaluateState(email, store);

    switch (state.type) {
      case "NEW_THREAD":
        // Map new thread ID to external person's email
        // biome-ignore lint/style/noNonNullAssertion: fine
        await store.put(state.threadId!, state.instanceId, {
          expirationTtl: 60 * 60 * 24 * 90, // 90 days
        });
        return {
          agentName,
          agentId: state.instanceId,
        };

      case "EXISTING_THREAD":
        // Route to existing mapped instance
        return {
          agentName,
          agentId: state.instanceId,
        };

      case "NO_THREAD":
        // No thread ID, route based on sender (could be owner or external)
        return {
          agentName,
          agentId: email.from.toLocaleLowerCase(),
        };

      default:
        throw new Error("Unhandled email state");
    }
  };
}

// ----------------- Helper Functions ---------------- //

export async function evaluateState(
  email: ForwardableEmailMessage,
  store: KVNamespace
): Promise<{
  type: "NEW_THREAD" | "EXISTING_THREAD" | "NO_THREAD";
  instanceId: string;
  threadId: string | null;
}> {
  const threadId = extractThreadId(email);

  if (!threadId) {
    return Promise.resolve({
      type: "NO_THREAD",
      instanceId: email.from.toLocaleLowerCase(),
      threadId,
    });
  }

  const existingMapping = await store.get(threadId);

  if (existingMapping) {
    return Promise.resolve({
      type: "EXISTING_THREAD",
      instanceId: existingMapping,
      threadId,
    });
  }
  return Promise.resolve({
    type: "NEW_THREAD",
    instanceId: email.from.toLocaleLowerCase(),
    threadId,
  });
}

/**
 * Extract the root thread ID from email headers
 *
 * Priority:
 * 1. If has References, use the first message ID in the References chain
 * 2. If this is a reply (has In-Reply-To), use In-Reply-To as thread ID
 * 3. Otherwise, use the current Message-ID (new thread)
 */
export function extractThreadId(email: ForwardableEmailMessage): string | null {
  const messageId = email.headers.get("Message-ID");
  const inReplyTo = email.headers.get("In-Reply-To");
  const references = email.headers.get("References");

  if (references) {
    // References contains space-separated message IDs, oldest first
    // biome-ignore lint/performance/useTopLevelRegex: fine
    const refList = references.split(/[\s,]+/).filter((r) => r.trim());
    if (refList.length > 0) {
      return refList[0] || null; // Return the root message ID
    }
  }

  if (inReplyTo) {
    return inReplyTo;
  }

  // This is a new thread, use the current Message-ID
  return messageId?.toLocaleLowerCase() || null;
}
