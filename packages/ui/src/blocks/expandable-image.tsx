import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { CloseIcon } from "../components/icons";

export interface ExpandableImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ExpandableImage({ src, alt, caption }: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [thumbnailRect, setThumbnailRect] = useState<DOMRect | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const getExpandedRect = useCallback(() => {
    const maxWidth = Math.min(window.innerWidth * 0.9, 900);
    const maxHeight = window.innerHeight * 0.85;
    let width = maxWidth;
    let height = width * (3 / 4);

    if (height > maxHeight) {
      height = maxHeight;
      width = height * (4 / 3);
    }

    return {
      width,
      height,
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
    };
  }, []);

  const handleExpand = () => {
    if (thumbnailRef.current) {
      setThumbnailRect(thumbnailRef.current.getBoundingClientRect());
      setIsAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsExpanded(true);
        });
      });
    }
  };

  const handleCollapse = useCallback(() => {
    if (thumbnailRef.current) {
      setThumbnailRect(thumbnailRef.current.getBoundingClientRect());
    }
    setIsExpanded(false);
  }, []);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName === "width" && !isExpanded) {
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        handleCollapse();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, handleCollapse]);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  const expandedRect = getExpandedRect();
  const currentRect = isExpanded ? expandedRect : thumbnailRect;

  return (
    <>
      <figure className="mt-4">
        {/** biome-ignore lint/a11y/useSemanticElements: fine */}
        <div
          aria-label="Expand image"
          className="relative aspect-4/3 w-full max-w-md cursor-zoom-in overflow-hidden rounded-lg bg-muted"
          onClick={handleExpand}
          onKeyDown={(e) => e.key === "Enter" && handleExpand()}
          ref={thumbnailRef}
          role="button"
          tabIndex={0}
        >
          <Image
            alt={alt}
            className="object-cover transition-transform duration-300 hover:scale-105"
            fill
            src={src || "/placeholder.svg"}
          />
        </div>
        {caption && (
          <figcaption className="mt-2 font-mono text-muted-foreground text-xs">
            {caption}
          </figcaption>
        )}
      </figure>

      {isAnimating && currentRect && (
        // biome-ignore lint/a11y/useSemanticElements: fine
        <div
          aria-label="Close expanded image"
          className={`fixed inset-0 z-50 transition-colors duration-400 ease-out ${
            isExpanded ? "bg-background/95 backdrop-blur-sm" : "bg-transparent"
          }`}
          onClick={handleCollapse}
          onKeyDown={(e) => e.key === "Enter" && handleCollapse()}
          role="button"
          tabIndex={0}
        >
          <div
            className="absolute cursor-zoom-out overflow-hidden rounded-lg transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            onTransitionEnd={handleTransitionEnd}
            style={{
              top: currentRect.top,
              left: currentRect.left,
              width: currentRect.width,
              height: currentRect.height,
            }}
          >
            <Image
              alt={alt}
              className="h-full w-full object-cover"
              fill
              priority
              sizes="(max-width: 900px) 90vw, 900px"
              src={src || "/placeholder.svg"}
            />
          </div>

          {caption && (
            <p
              className={`fixed left-0 w-full text-center font-mono text-muted-foreground text-sm transition-opacity duration-300 ${
                isExpanded ? "opacity-100 delay-150" : "opacity-0"
              }`}
              style={{
                top: expandedRect.top + expandedRect.height + 16,
              }}
            >
              {caption}
            </p>
          )}

          <Button
            aria-label="Close"
            className={`absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-foreground/20 ${
              isExpanded ? "opacity-100 delay-200" : "opacity-0"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleCollapse();
            }}
          >
            <CloseIcon className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}
