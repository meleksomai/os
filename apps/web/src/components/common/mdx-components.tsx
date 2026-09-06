import { Link } from "@tanstack/react-router";
import { Callout } from "@workspace/ui/blocks/callout";
// biome-ignore lint/performance/noNamespaceImport: needed for MDX components
import * as CodeBlock from "@workspace/ui/blocks/code-block";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "@workspace/ui/blocks/headings";
import { Highlight } from "@workspace/ui/blocks/highlight";
import { Quote } from "@workspace/ui/blocks/quote";
import { RelativeTime } from "@workspace/ui/blocks/relative-time";
import { ThemeImage } from "@workspace/ui/blocks/themed-image";
import { GitHubIcon, XIcon } from "@workspace/ui/components/icons";
import { parseGitHubAlert } from "@workspace/ui/lib/gmf";
import { cn } from "@workspace/ui/lib/utils";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

type ParagraphProps = ComponentPropsWithoutRef<"p">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type ListItemProps = ComponentPropsWithoutRef<"li">;
type ImageProps = ComponentPropsWithoutRef<"img">;

function isFootnotesSection(props: React.HTMLAttributes<HTMLElement>) {
  // remark-gfm often emits: <section data-footnotes class="footnotes">
  // Some renderers use <div class="footnotes"> or <section class="footnotes">
  const anyProps = props as unknown;
  return (
    (anyProps as Record<string, unknown>)["data-footnotes"] !== undefined ||
    props.className?.split(" ").includes("footnotes") ||
    props.id === "footnotes"
  );
}

export const mdxComponents = {
  // Components the essays use directly (`<Quote>`, `<ThemeImage>`, ...),
  // provided here so essays need no import statements.
  Quote,
  ThemeImage,
  RelativeTime,
  Highlight,
  GitHubIcon,
  XIcon,
  // Allows customizing built-in components, e.g. to add styling.
  h1: (props: ComponentPropsWithoutRef<"h1">) => <Heading1 {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <Heading2 {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <Heading3 {...props} />,
  h4: (props: ComponentPropsWithoutRef<"h4">) => <Heading4 {...props} />,
  h5: (props: ComponentPropsWithoutRef<"h5">) => <Heading5 {...props} />,
  h6: (props: ComponentPropsWithoutRef<"h6">) => <Heading6 {...props} />,
  p: (props: ParagraphProps) => <p className="my-6 leading-loose" {...props} />,
  a: ({ href, ...props }: AnchorProps) => {
    const className =
      "underline underline-offset-3 decoration-gray-200 dark:decoration-gray-700 hover:decoration-gray-700 dark:hover:decoration-gray-200 transition-colors";
    if (href?.startsWith("/")) {
      return <Link className={className} {...props} to={href as never} />;
    }
    if (href?.startsWith("#")) {
      return <a className={className} href={href} {...props} />;
    }
    return (
      <a
        className={className}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        {...props}
      />
    );
  },
  ol: (props: ListProps) => (
    <ol className="my-6 list-decimal space-y-2 pl-5 leading-loose" {...props} />
  ),
  ul: (props: ListProps) => (
    <ul className="my-6 list-disc space-y-1 pl-5 leading-loose" {...props} />
  ),
  li: (props: ListItemProps) => (
    <li className="my-3 pl-1 leading-loose" {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="font-serif" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  img: ({ alt, ...props }: ImageProps) => (
    <img alt={alt ?? ""} height={720} width={1200} {...props} />
  ),
  blockquote: ({
    children,
    ...props
  }: ComponentPropsWithoutRef<"blockquote">) => {
    // Parse GitHub-style alerts: > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]
    const alertInfo = parseGitHubAlert(children);

    if (alertInfo) {
      return (
        <Callout className="my-4" type={alertInfo.type}>
          {alertInfo.content}
        </Callout>
      );
    }

    // Default blockquote rendering when not a GitHub alert
    return <Callout {...props}>{children}</Callout>;
  },
  // Don't pass the tabindex prop from shiki, most browsers
  // now handle scroll containers focus out of the box
  pre: ({ tabIndex, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <CodeBlock.Pre {...props} />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => (
    <CodeBlock.Code
      className={cn(
        className,
        "inline-code:rounded inline-code:bg-slate-100 inline-code:px-[0.3em] inline-code:py-[0.2em] inline-code:text-[0.9em] dark:inline-code:bg-slate-800"
      )}
      {...props}
    />
  ),
  figure: (props: ComponentPropsWithoutRef<"figure">) => {
    if ("data-rehype-pretty-code-figure" in props) {
      return <CodeBlock.Root {...props} />;
    }

    return <figure {...props} />;
  },
  figcaption: (props: ComponentPropsWithoutRef<"figcaption">) => {
    if ("data-rehype-pretty-code-title" in props) {
      return <CodeBlock.Panel {...props} />;
    }

    return <figcaption {...props} />;
  },
  // --- Inline footnote reference wrapper ---
  sup: ({ className, children, ...props }: ComponentPropsWithoutRef<"sup">) => (
    <sup
      {...props}
      className={[
        // your styling
        "align-super text-[0.7em] text-muted-foreground leading-none hover:text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </sup>
  ),
  // --- Footnotes container ---
  section: ({ className, ...props }: ComponentPropsWithoutRef<"section">) => {
    if (isFootnotesSection(props)) {
      return (
        <section
          {...props}
          className={cn(
            "mt-10 border-t pt-6",
            "mt-8 text-muted-foreground text-sm",
            className
          )}
        />
      );
    }
    return <section {...props} className={className} />;
  },
} satisfies MDXComponents;
