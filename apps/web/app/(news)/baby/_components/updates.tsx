"use client";

import { ExpandableImage } from "@workspace/ui/blocks/expandable-image";
import { formatPublishedAtWithRelative } from "@/lib/date";

interface Update {
  date: Date;
  message: string;
  image?: {
    src: string;
    caption?: string;
    camera?: string;
    lens?: string;
    aperture?: string;
  };
}

const updates: Update[] = [
  {
    date: new Date("2026-01-26T10:45:00"),
    message:
      "We are heading to the hospital for delivery. Mommy is doing great and we can't wait to meet our little one! We will keep you updated.",
  },
];

export function Updates() {
  if (updates.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-widest">
        Latest Updates
      </h3>
      <div className="space-y-8">
        {updates.map((update) => (
          <article
            className="relative border-border border-l-2 pl-6"
            key={update.date.toISOString()}
          >
            <div className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-foreground" />

            <time className="mb-2 block font-mono text-muted-foreground text-xs">
              {formatPublishedAtWithRelative(update.date)}
            </time>

            <p className="text-foreground leading-relaxed">{update.message}</p>

            {update.image && (
              <ExpandableImage
                alt={update.image.caption || "Update image"}
                src={update.image.src}
              />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
