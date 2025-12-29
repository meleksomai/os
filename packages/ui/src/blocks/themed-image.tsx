"use client";

import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "../lib/utils";

type ThemeImageProps = Omit<NextImageProps, "src" | "fill"> & {
  src?: NextImageProps["src"];
  lightSrc?: NextImageProps["src"];
  darkSrc?: NextImageProps["src"];

  /**
   * Only used when width/height are NOT provided.
   * Helps reserve layout space for responsive images.
   */
  aspectRatio?: number;

  sizes?: string;
};

export function ThemeImage({
  className,
  src,
  lightSrc,
  darkSrc,
  alt,
  aspectRatio,
  sizes = "(min-width: 1024px) 900px, 100vw",
  ...props
}: ThemeImageProps) {
  const hasThemePair = Boolean(lightSrc && darkSrc);

  const hasIntrinsic =
    typeof props.width === "number" && typeof props.height === "number";

  // Helper to build props for NextImage without mixing fill + width/height.
  const imageSizingProps = hasIntrinsic
    ? { width: props.width, height: props.height }
    : { fill: true as const, sizes };

  // If theme pair exists: render both and toggle via CSS (no JS timing).
  if (hasThemePair) {
    return hasIntrinsic ? (
      <span className={cn("block w-full", className)}>
        <NextImage
          {...props}
          {...imageSizingProps}
          alt={alt ?? ""}
          className={cn("h-auto w-full object-contain dark:hidden")}
          src={lightSrc!}
        />
        <NextImage
          {...props}
          {...imageSizingProps}
          alt={alt ?? ""}
          className={cn("hidden h-auto w-full object-contain dark:block")}
          src={darkSrc!}
        />
      </span>
    ) : (
      <span
        className={cn("relative block w-full overflow-hidden", className)}
        style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
      >
        <NextImage
          {...props}
          {...imageSizingProps}
          alt={alt ?? ""}
          className="object-contain dark:hidden"
          src={lightSrc!}
        />
        <NextImage
          {...props}
          {...imageSizingProps}
          alt={alt ?? ""}
          className="object-contain hidden dark:block"
          src={darkSrc!}
        />
      </span>
    );
  }

  // Single-source fallback
  const chosen = src ?? lightSrc ?? darkSrc;
  if (!chosen) return null;

  return hasIntrinsic ? (
    <NextImage
      {...props}
      {...imageSizingProps}
      alt={alt ?? ""}
      className={cn("h-auto w-full object-contain", className)}
      src={chosen}
    />
  ) : (
    <span
      className={cn("relative block w-full overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
    >
      <NextImage
        {...props}
        {...imageSizingProps}
        alt={alt ?? ""}
        className="object-contain"
        src={chosen}
      />
    </span>
  );
}
