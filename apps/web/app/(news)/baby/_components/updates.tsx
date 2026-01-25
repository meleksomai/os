"use client";

import { formatPublishedAtWithRelative } from "@/lib/date";

interface Update {
  date: Date;
  message: string;
}

const updates: Update[] = [
  {
    date: new Date("2026-01-22T10:00:00"),
    message:
      "We delayed the scheduled delivery to avoid any risk to infecting the baby with a cold I caught. New estimated delivery date is now January 26th.",
  },
];

export function Updates() {
  if (updates.length === 0) return null;

  return (
    <div className="mt-12 w-full text-start">
      <h3 className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-widest">
        Latest Updates
      </h3>
      <div className="space-y-4 font-mono text-sm md:space-y-6">
        {updates.map((update) => (
          <div className="gap-3 py-1" key={update.date.toISOString()}>
            <p className="shrink-0 text-muted-foreground text-xs">
              {formatPublishedAtWithRelative(update.date)}
            </p>
            <p className="text-foreground">{update.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
