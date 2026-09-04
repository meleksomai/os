/** biome-ignore-all lint/correctness/useImageSize: images are sized by their CSS aspect-ratio container */
"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../lib/utils";

type ThemeImageProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src?: string;
  lightSrc?: string;
  darkSrc?: string;

  /**
   * Only used when width/height are NOT provided.
   * Helps reserve layout space for responsive images.
   */
  aspectRatio?: number;
};

export function ThemeImage({
  className,
  src,
  lightSrc,
  darkSrc,
  alt,
  aspectRatio,
  ...props
}: ThemeImageProps) {
  const hasIntrinsic =
    typeof props.width === "number" && typeof props.height === "number";

  // If theme pair exists: render both and toggle via CSS (no JS timing).
  if (lightSrc && darkSrc) {
    return hasIntrinsic ? (
      <span className={cn("block w-full", className)}>
        <img
          {...props}
          alt={alt ?? ""}
          className={cn("h-auto w-full object-contain dark:hidden")}
          src={lightSrc}
        />
        <img
          {...props}
          alt={alt ?? ""}
          className={cn("hidden h-auto w-full object-contain dark:block")}
          src={darkSrc}
        />
      </span>
    ) : (
      <span
        className={cn("relative block w-full overflow-hidden", className)}
        style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
      >
        <img
          {...props}
          alt={alt ?? ""}
          className="absolute inset-0 h-full w-full object-contain dark:hidden"
          src={lightSrc}
        />
        <img
          {...props}
          alt={alt ?? ""}
          className="absolute inset-0 hidden h-full w-full object-contain dark:block"
          src={darkSrc}
        />
      </span>
    );
  }

  // Single-source fallback
  const chosen = src ?? lightSrc ?? darkSrc;
  if (!chosen) {
    return null;
  }

  return hasIntrinsic ? (
    <img
      {...props}
      alt={alt ?? ""}
      className={cn("h-auto w-full object-contain", className)}
      src={chosen}
    />
  ) : (
    <span
      className={cn("relative block w-full overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
    >
      <img
        {...props}
        alt={alt ?? ""}
        className="absolute inset-0 h-full w-full object-contain"
        src={chosen}
      />
    </span>
  );
}
