"use client";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip";
import { cn } from "../lib/utils";

interface RelativeTimeProps {
  date: Date | string | number;
  className?: string;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const dateObj = new Date(date);
  const [relativeTime, setRelativeTime] = useState(() =>
    formatDistanceToNow(dateObj, { addSuffix: true })
  );

  useEffect(() => {
    const updateRelativeTime = () => {
      setRelativeTime(formatDistanceToNow(dateObj, { addSuffix: true }));
    };

    // Update every minute
    const interval = setInterval(updateRelativeTime, 60_000);

    return () => clearInterval(interval);
  }, [dateObj]);

  const formattedDate = dateObj.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <Tooltip>
      <TooltipTrigger>
        <span
          className={cn(
            "cursor-help border-muted-foreground/50 border-b-2 border-dashed transition-colors hover:border-primary",
            className
          )}
        >
          <span className={className}>{relativeTime}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{formattedDate}</TooltipContent>
    </Tooltip>
  );
}
