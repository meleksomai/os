import * as CodeBlock from "@workspace/ui/blocks/code-block";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "@workspace/ui/blocks/headings";
import { cn } from "@workspace/ui/lib/utils";
import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type ParagraphProps = ComponentPropsWithoutRef<"p">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type ListItemProps = ComponentPropsWithoutRef<"li">;

function isFootnotesSection(props: React.HTMLAttributes<HTMLElement>) {
  // remark-gfm often emits: <section data-footnotes class="footnotes">
  // Some renderers use <div class="footnotes"> or <section class="footnotes">
  const anyProps = props as any;
  return (
    anyProps["data-footnotes"] !== undefined ||
    props.className?.split(" ").includes("footnotes") ||
    props.id === "footnotes"
  );
}

const components = {
  // Allows customizing built-in components, e.g. to add styling.
  h1: (props: ComponentPropsWithoutRef<"h1">) => <Heading1 {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <Heading2 {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <Heading3 {...props} />,
  h4: (props: ComponentPropsWithoutRef<"h4">) => <Heading4 {...props} />,
  h5: (props: ComponentPropsWithoutRef<"h5">) => <Heading5 {...props} />,
  h6: (props: ComponentPropsWithoutRef<"h6">) => <Heading6 {...props} />,
  p: (props: ParagraphProps) => <p className="my-6 leading-loose" {...props} />,
  a: ({ href, ...props }: AnchorProps) => {
    const className = "underline";
    if (href?.startsWith("/")) {
      return <Link className={className} href={href} {...props} />;
    }
    if (href?.startsWith("#")) {
      return <a className={className} href={href} {...props} />;
    }
    return (
      <a
        className={cn(
          "underline-offset-3 decoration-muted-foreground",
          className
        )}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        {...props}
      />
    );
  },
  ol: (props: ListProps) => (
    <ol className="my-6 list-decimal space-y-2 pl-5" {...props} />
  ),
  ul: (props: ListProps) => (
    <ul className="my-6 list-disc space-y-1 pl-5" {...props} />
  ),
  li: (props: ListItemProps) => <li className="my-3 pl-1" {...props} />,
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="font-serif" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  img: (props) => (
    <Image height={720} width={1200} {...(props as ImageProps)} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
  ),
  // Don't pass the tabindex prop from shiki, most browsers
  // now handle scroll containers focus out of the box
  pre: ({ tabIndex, ...props }) => <CodeBlock.Pre {...props} />,
  code: (props) => (
    <CodeBlock.Code className="data-[inline]:mx-[0.1em]" {...props} />
  ),
  figure: (props) => {
    if ("data-rehype-pretty-code-figure" in props) {
      return <CodeBlock.Root {...props} />;
    }

    return <figure {...props} />;
  },
  figcaption: (props) => {
    if ("data-rehype-pretty-code-title" in props) {
      return <CodeBlock.Panel {...props} />;
    }

    return <figcaption {...props} />;
  },
  // --- Inline footnote reference wrapper ---
  sup: ({ className, children, ...props }) => (
    <sup
      {...props}
      className={[
        // your styling
        "align-super text-[0.75em] leading-none text-muted-foreground hover:text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </sup>
  ),
  // --- Footnotes container ---
  section: ({ className, ...props }) => {
    if (isFootnotesSection(props)) {
      return (
        <section
          {...props}
          className={[
            "mt-10 border-t pt-6",
            "mt-8 text-sm text-muted-foreground ",
            className,
          ]}
        />
      );
    }
    return <section {...props} className={className} />;
  },
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
