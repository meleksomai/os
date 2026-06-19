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
            "cursor-help underline decoration-gray-200 decoration-dotted underline-offset-3 transition-colors hover:decoration-gray-700 dark:decoration-gray-700 dark:hover:decoration-gray-200",
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
