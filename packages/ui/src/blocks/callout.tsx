import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface CalloutProps {
  children: ReactNode;
  className?: string;
}

export function Callout({ children, className }: CalloutProps) {
  return (
    <div
      className={cn(
        "my-5 border-l-2 border-foreground/20 pl-6 pr-4 leading-relaxed text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
