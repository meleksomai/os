/**
 * Create a mock email for testing
 */
export const createMockEmailHelper = (
  overrides: Partial<ForwardableEmailMessage> = {}
): ForwardableEmailMessage => {
  const encoder = new TextEncoder();
  const streamBody = encoder.encode("Test body");

  return {
    from: overrides.from ?? "sender@example.com",
    to: overrides.to ?? "recipient@example.com",
    raw:
      overrides.raw ??
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(streamBody);
          controller.close();
        },
      }),
    headers: overrides.headers ?? new Headers(),
    rawSize: overrides.rawSize ?? streamBody.byteLength,
    setReject: overrides.setReject ?? (() => {}),
    forward: overrides.forward ?? (async () => {}),
    reply: overrides.reply ?? (async (_message: EmailMessage) => {}),
  };
};
