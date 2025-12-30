import type { EmailResolver } from "agents";

/**
 * Thread-Based Email Resolver
 *
 * Routes emails based on conversation threads, ensuring all emails in a thread
 * route to the same Durable Object instance regardless of sender.
 *
 * This maintains conversation context even when:
 * - External person sends initial email
 * - Owner replies (with or without external person in TO/CC)
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
  ownerEmail: string,
  store: KVNamespace
): EmailResolver<Env> {
  return async (email: ForwardableEmailMessage, _env: Env) => {
    const from = email.from.toLowerCase();
    const owner = ownerEmail.toLowerCase();

    // Extract thread identifiers from headers
    const messageId = email.headers.get("Message-ID");
    const inReplyTo = email.headers.get("In-Reply-To");
    const references = email.headers.get("References");

    // Determine the thread ID (use first message in thread)
    const threadId = extractRootThreadId(messageId, inReplyTo, references);

    if (!threadId) {
      console.warn("No thread ID found, falling back to sender-based routing");
      return {
        agentName,
        agentId: from,
      };
    }

    // Check if this is a reply to an existing thread
    if (inReplyTo || references) {
      // Lookup the thread to find the external person
      const externalPerson = await store.get(threadId);

      if (externalPerson) {
        console.log(`Thread ${threadId} belongs to ${externalPerson}`);
        return {
          agentName,
          agentId: externalPerson,
        };
      }

      console.warn(
        `Thread ${threadId} not found in KV, treating as new thread`
      );
    }

    // This is a new thread
    // Determine the external person (not the owner)
    const externalPerson = from === owner ? "unknown" : from;

    // Store the mapping for future lookups
    // TTL: 90 days (threads older than this will be treated as new)
    await store.put(threadId, externalPerson, {
      expirationTtl: 60 * 60 * 24 * 90,
    });

    console.log(`New thread ${threadId} created for ${externalPerson}`);

    return {
      agentName,
      agentId: externalPerson,
    };
  };
}

/**
 * Extract the root thread ID from email headers
 *
 * Priority:
 * 1. If this is a reply (has In-Reply-To), use In-Reply-To as thread ID
 * 2. If has References, use the first message ID in the References chain
 * 3. Otherwise, use the current Message-ID (new thread)
 */
function extractRootThreadId(
  messageId: string | null,
  inReplyTo: string | null,
  references: string | null
): string | null {
  // If this is a reply, the thread ID is either:
  // - The In-Reply-To message (immediate parent)
  // - Or the first message in References (root of thread)
  if (references) {
    // References contains space-separated message IDs, oldest first
    const refList = references.split(/[\s,]+/).filter((r) => r.trim());
    if (refList.length > 0) {
      return refList[0] || null; // Return the root message ID
    }
  }

  if (inReplyTo) {
    return inReplyTo;
  }

  // This is a new thread, use the current Message-ID
  return messageId;
}
