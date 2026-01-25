import { cn } from "@workspace/ui/lib/utils";
import type React from "react";

interface QuoteProps {
  children: React.ReactNode;
  author: string;
  source?: string;
  className?: string;
}

export function Quote({ children, author, source, className }: QuoteProps) {
  return (
    <figure className={cn("my-12 max-w-4xl", className)}>
      <blockquote className="relative">
        <span className="absolute -left-4 font-serif text-4xl md:-left-5 md:text-5xl">
          “
        </span>
        <div className="text-balance font-normal font-serif text-2xl leading-10 md:text-3xl">
          {children}
        </div>
      </blockquote>
      {(author || source) && (
        <figcaption className="mt-8 flex items-center justify-end gap-3 text-sm">
          <div className="h-px w-12 bg-border" />
          <div>
            <span className="font-medium text-foreground">{author}</span>
            {source && (
              <>
                <span className="text-muted-foreground">, </span>
                <span className="text-muted-foreground">{source}</span>
              </>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  );
}
