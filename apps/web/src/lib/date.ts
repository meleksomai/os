import { formatDistance } from "date-fns";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export function parsePublishedAt(publishedAt: string): Date {
  if (!isoDateRegex.test(publishedAt)) {
    throw new Error(
      `Invalid publishedAt "${publishedAt}". Use ISO format YYYY-MM-DD (e.g. 2024-06-01).`
    );
  }

  const utcMidnight = new Date(`${publishedAt}T00:00:00.000Z`);
  if (Number.isNaN(utcMidnight.getTime())) {
    throw new Error(
      `Invalid publishedAt "${publishedAt}". Use ISO format YYYY-MM-DD (e.g. 2024-06-01).`
    );
  }

  return utcMidnight;
}

export function formatPublishedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatPublishedAtWithRelative(
  date: Date,
  now: Date = new Date()
): string {
  const fullDate = formatPublishedAt(date);
  const relative = formatDistance(date, now, { addSuffix: true });
  return `${fullDate} (${relative})`;
}
