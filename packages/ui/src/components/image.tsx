import type { CSSProperties, ImgHTMLAttributes } from "react";
import { cn } from "../lib/utils";

// Backward-compatible subset of next/image's prop surface.
export type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "width" | "height"
> & {
  src: string;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  /** next/image fill mode -> absolutely-positioned, object-fit cover. */
  fill?: boolean;
  /** Accepted for compatibility, no-ops in the portable shim. */
  priority?: boolean;
  sizes?: string;
  quality?: number;
  loading?: "eager" | "lazy";
};

export function Image({
  src,
  alt,
  width,
  height,
  fill,
  priority: _priority,
  sizes: _sizes,
  quality: _quality,
  loading,
  className,
  style,
  ...rest
}: ImageProps) {
  if (fill) {
    const fillStyle: CSSProperties = {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      ...style,
    };
    return (
      // biome-ignore lint/performance/noImgElement: portable shim replacing next/image
      // biome-ignore lint/correctness/useImageSize: fill mode is absolutely positioned to cover its container (next/image fill parity), so explicit width/height do not apply
      <img
        alt={alt}
        className={className}
        loading={loading ?? "lazy"}
        src={src}
        style={fillStyle}
        {...rest}
      />
    );
  }
  return (
    // biome-ignore lint/performance/noImgElement: portable shim replacing next/image
    <img
      alt={alt}
      className={cn(className)}
      height={height}
      loading={loading ?? "lazy"}
      src={src}
      style={style}
      width={width}
      {...rest}
    />
  );
}

export default Image;
