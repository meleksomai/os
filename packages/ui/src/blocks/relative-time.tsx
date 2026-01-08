"use client";

import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip";
import { cn } from "../lib/utils";

interface RelativeTimeProps {
  date: Date | string | number;
  className?: string;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "yesterday";
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? "last week" : `${diffInWeeks} weeks ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? "last month" : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? "last year" : `${diffInYears} years ago`;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const dateObj = new Date(date);
  const [relativeTime, setRelativeTime] = useState(() =>
    getRelativeTime(dateObj)
  );

  useEffect(() => {
    const updateRelativeTime = () => {
      setRelativeTime(getRelativeTime(dateObj));
    };

    // Update every minute
    const interval = setInterval(updateRelativeTime, 60000);

    return () => clearInterval(interval);
  }, [dateObj]);

  const formattedDate = dateObj.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Tooltip>
      <TooltipTrigger>
        <span
          className={cn(
            "cursor-help border-b-2 border-dashed border-muted-foreground/50 hover:border-primary transition-colors",
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
