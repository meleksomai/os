import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import {
  AlertIcon,
  ErrorIcon,
  InfoIcon,
  SuccessIcon,
} from "../components/icons";
import { cn } from "../lib/utils";

const calloutVariants = cva(
  "flex min-w-0 flex-1 gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed [&_[data-slot=icon]]:mt-1.5 [&_[data-slot=icon]]:size-4 [&_[data-slot=icon]]:shrink-0 [&_[data-slot=title]]:font-medium",
  {
    variants: {
      type: {
        note: "border-blue-200 text-blue-700 dark:border-blue-800/60 dark:text-blue-300 [&_[data-slot=icon]]:text-blue-500 dark:[&_[data-slot=icon]]:text-blue-400",
        default:
          "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400 [&_[data-slot=icon]]:text-gray-500 dark:[&_[data-slot=icon]]:text-gray-400 [&_[data-slot=title]]:text-gray-700 dark:[&_[data-slot=title]]:text-gray-300",
        secondary:
          "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400 [&_[data-slot=icon]]:text-gray-500 dark:[&_[data-slot=icon]]:text-gray-400 [&_[data-slot=title]]:text-gray-700 dark:[&_[data-slot=title]]:text-gray-300",
        tip: "border-green-200 text-green-700 dark:border-green-800/60 dark:text-green-300 [&_[data-slot=icon]]:text-green-500 dark:[&_[data-slot=icon]]:text-green-400",
        success:
          "border-green-200 text-green-700 dark:border-green-800/60 dark:text-green-300 [&_[data-slot=icon]]:text-green-500 dark:[&_[data-slot=icon]]:text-green-400",
        important:
          "border-violet-200 text-violet-700 dark:border-violet-800/60 dark:text-violet-300 [&_[data-slot=icon]]:text-violet-500 dark:[&_[data-slot=icon]]:text-violet-400",
        cyan: "border-cyan-200 text-cyan-700 dark:border-cyan-800/60 dark:text-cyan-300 [&_[data-slot=icon]]:text-cyan-500 dark:[&_[data-slot=icon]]:text-cyan-400",
        warning:
          "border-amber-200 text-amber-700 dark:border-amber-700/60 dark:text-amber-300 [&_[data-slot=icon]]:text-amber-500 dark:[&_[data-slot=icon]]:text-amber-400",
        caution:
          "border-red-200 text-red-700 dark:border-red-800/60 dark:text-red-300 [&_[data-slot=icon]]:text-red-500 dark:[&_[data-slot=icon]]:text-red-400",
        error:
          "border-red-200 text-red-700 dark:border-red-800/60 dark:text-red-300 [&_[data-slot=icon]]:text-red-500 dark:[&_[data-slot=icon]]:text-red-400",
      },
      variant: {
        outline: "",
        fill: "",
      },
      size: {
        base: "text-base",
        sm: "text-sm",
        xs: "text-xs",
      },
    },
    compoundVariants: [
      // Outline backgrounds
      {
        type: "note",
        variant: "outline",
        className: "bg-blue-50/50 dark:bg-blue-950/30",
      },
      {
        type: "default",
        variant: "outline",
        className: "bg-gray-50/50 dark:bg-gray-900/30",
      },
      {
        type: "secondary",
        variant: "outline",
        className: "bg-gray-100/50 dark:bg-gray-800/30",
      },
      {
        type: "tip",
        variant: "outline",
        className: "bg-green-50/50 dark:bg-green-950/30",
      },
      {
        type: "success",
        variant: "outline",
        className: "bg-green-50/50 dark:bg-green-950/30",
      },
      {
        type: "important",
        variant: "outline",
        className: "bg-violet-50/50 dark:bg-violet-950/30",
      },
      {
        type: "cyan",
        variant: "outline",
        className: "bg-cyan-50/50 dark:bg-cyan-950/30",
      },
      {
        type: "warning",
        variant: "outline",
        className: "bg-amber-50/50 dark:bg-amber-950/30",
      },
      {
        type: "caution",
        variant: "outline",
        className: "bg-red-50/50 dark:bg-red-950/30",
      },
      {
        type: "error",
        variant: "outline",
        className: "bg-red-50/50 dark:bg-red-950/30",
      },
      // Fill backgrounds and icon intensity
      {
        type: "note",
        variant: "fill",
        className:
          "border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 [&_[data-slot=icon]]:text-blue-600",
      },
      {
        type: "default",
        variant: "fill",
        className:
          "bg-gray-100 dark:bg-gray-800/60 [&_[data-slot=icon]]:text-gray-600",
      },
      {
        type: "secondary",
        variant: "fill",
        className:
          "bg-gray-200 dark:bg-gray-700/60 [&_[data-slot=icon]]:text-gray-600",
      },
      {
        type: "tip",
        variant: "fill",
        className:
          "border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-950/60 [&_[data-slot=icon]]:text-green-600",
      },
      {
        type: "success",
        variant: "fill",
        className:
          "border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-950/60 [&_[data-slot=icon]]:text-green-600",
      },
      {
        type: "important",
        variant: "fill",
        className:
          "border-violet-200 bg-violet-100 dark:border-violet-800 dark:bg-violet-950/60 [&_[data-slot=icon]]:text-violet-600",
      },
      {
        type: "cyan",
        variant: "fill",
        className:
          "border-cyan-200 bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/60 [&_[data-slot=icon]]:text-cyan-600",
      },
      {
        type: "warning",
        variant: "fill",
        className:
          "border-amber-200 bg-amber-100 dark:border-amber-700 dark:bg-amber-950/60 [&_[data-slot=icon]]:text-amber-600",
      },
      {
        type: "caution",
        variant: "fill",
        className:
          "border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-950/60 [&_[data-slot=icon]]:text-red-600",
      },
      {
        type: "error",
        variant: "fill",
        className:
          "border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-950/60 [&_[data-slot=icon]]:text-red-600",
      },
    ],
    defaultVariants: {
      type: "default",
      variant: "outline",
      size: "sm",
    },
  }
);

type CalloutType = NonNullable<VariantProps<typeof calloutVariants>["type"]>;

const calloutIcons: Record<CalloutType, React.ElementType> = {
  note: InfoIcon,
  default: InfoIcon,
  secondary: InfoIcon,
  tip: InfoIcon,
  success: SuccessIcon,
  important: InfoIcon,
  cyan: InfoIcon,
  warning: AlertIcon,
  caution: ErrorIcon,
  error: ErrorIcon,
};

const calloutTitles: Record<CalloutType, string> = {
  note: "Note",
  default: "Note",
  secondary: "Note",
  tip: "Tip",
  success: "Success",
  important: "Important",
  cyan: "Info",
  warning: "Warning",
  caution: "Caution",
  error: "Error",
};

interface CalloutProps extends VariantProps<typeof calloutVariants> {
  title?: string;
  showLabel?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function Callout({
  type,
  variant,
  title,
  showLabel = false,
  children,
  className,
}: CalloutProps) {
  const Icon = calloutIcons[type ?? "default"];
  const displayTitle = title ?? calloutTitles[type ?? "default"];

  return (
    <div className={cn(calloutVariants({ type, variant }), className)}>
      <Icon data-slot="icon" strokeWidth={2} />
      <div data-slot="content">
        {showLabel && <span data-slot="title">{displayTitle}: </span>}
        <span className="[&>p]:inline">{children}</span>
      </div>
    </div>
  );
}

export { Callout, calloutVariants };
