const DEFAULT_BASE_URL = "https://ntfy.sh";

export interface NtfyMessage {
  topic: string;
  title?: string;
  message: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

export interface NtfyOptions {
  baseUrl?: string;
}

export function publish(
  msg: NtfyMessage,
  options?: NtfyOptions
): Promise<Response> {
  const baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;

  return fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: msg.topic,
      title: msg.title,
      message: msg.message,
      priority: msg.priority,
      tags: msg.tags,
    }),
  });
}
