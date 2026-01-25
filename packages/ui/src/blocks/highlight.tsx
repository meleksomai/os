"use client";

import type * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip";
import { cn } from "../lib/utils";

interface HighlightProps {
  text: string;
  children: React.ReactNode;
  className: string;
}

export function Highlight({ text, children, className }: HighlightProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <span
          className={cn(
            "cursor-help border-muted-foreground/50 border-b-2 border-dashed transition-colors hover:border-primary",
            className
          )}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}
