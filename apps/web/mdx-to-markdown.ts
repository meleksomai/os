import type { Root, RootContent } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

/**
 * Plain markdown from the body of an MDX essay, for user agents that ask for
 * text/markdown. The body is parsed with the MDX grammar, ESM statements and
 * expressions are dropped, and JSX components become their markdown
 * equivalent (see `componentToMarkdown`). Runs at build time, in the essays
 * collection's `transform` (content-collections.ts).
 */
export function mdxToMarkdown(source: string): string {
  const tree = mdxParser.parse(source);
  const markdownTree: Root = {
    type: "root",
    children: withMergedText(
      tree.children.flatMap((child) => toMarkdownNodes(child as MdxNode))
    ) as RootContent[],
  };
  return stringifier.stringify(markdownTree).trim();
}

/** The words of a markdown document, without its syntax; what reading time is measured on. */
export function plainText(markdown: string): string {
  return blockTexts(markdownParser.parse(markdown) as MdxNode).join("\n");
}

const BLOCK_CONTAINERS = new Set([
  "root",
  "blockquote",
  "list",
  "listItem",
  "footnoteDefinition",
  "table",
  "tableRow",
]);

// One string per block, so words of neighbouring blocks never run together.
function blockTexts(node: MdxNode): string[] {
  if (BLOCK_CONTAINERS.has(node.type) && node.children) {
    return node.children.flatMap(blockTexts);
  }
  return [mdastToString(node)];
}

const mdxParser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);
const markdownParser = unified().use(remarkParse).use(remarkGfm);
const stringifier = unified()
  .use(remarkGfm)
  .use(remarkStringify, { bullet: "-", fences: true, listItemIndent: "one" });

/** The node types remark-mdx adds to mdast, loosely typed. */
interface MdxNode {
  type: string;
  name?: string | null;
  value?: string;
  attributes?: MdxAttribute[];
  children?: MdxNode[];
}

interface MdxAttribute {
  type: string;
  name?: string;
  value?: string | { type: string; value: string } | null;
}

const DROPPED_NODE_TYPES = new Set([
  "mdxjsEsm", // import/export statements
  "mdxFlowExpression", // `{...}` expressions
  "mdxTextExpression",
]);

const JSX_NODE_TYPES = new Set(["mdxJsxFlowElement", "mdxJsxTextElement"]);

function toMarkdownNodes(node: MdxNode): MdxNode[] {
  if (DROPPED_NODE_TYPES.has(node.type)) {
    return [];
  }
  if (JSX_NODE_TYPES.has(node.type)) {
    return componentToMarkdown(node);
  }
  if (node.children) {
    return [
      {
        ...node,
        children: withMergedText(node.children.flatMap(toMarkdownNodes)),
      },
    ];
  }
  return [node];
}

/**
 * The markdown equivalent of a JSX component: `<Quote>` becomes a blockquote
 * with an attribution line, `<RelativeTime>` its date, `<br />` a line break,
 * anything with an image source an image, and everything else what it wraps
 * (so a self-closing icon disappears).
 */
function componentToMarkdown(node: MdxNode): MdxNode[] {
  const children = withMergedText(
    (node.children ?? []).flatMap(toMarkdownNodes)
  );

  if (node.name === "Quote") {
    const attribution = [attribute(node, "author"), attribute(node, "source")]
      .filter(Boolean)
      .join(", ");
    if (attribution) {
      children.push(paragraph(`— ${attribution}`));
    }
    return [{ type: "blockquote", children }];
  }

  if (node.name === "RelativeTime") {
    const date = attribute(node, "date");
    return date ? [text(date)] : [];
  }

  if (node.name === "br") {
    return [{ type: "break" }];
  }

  const src =
    attribute(node, "src") ??
    attribute(node, "lightSrc") ??
    attribute(node, "darkSrc");
  if (src) {
    const image = {
      type: "image",
      url: src,
      alt: attribute(node, "alt") ?? "",
    } as MdxNode;
    // An image is phrasing content: a block-level component gets its own paragraph.
    return node.type === "mdxJsxFlowElement"
      ? [{ type: "paragraph", children: [image] }]
      : [image];
  }

  return children;
}

/** A string attribute, written either as `name="value"` or as `name={"value"}`. */
function attribute(node: MdxNode, name: string): string | undefined {
  const found = node.attributes?.find(
    (candidate) =>
      candidate.type === "mdxJsxAttribute" && candidate.name === name
  );
  if (typeof found?.value === "string") {
    return found.value;
  }
  if (found?.value && typeof found.value === "object") {
    try {
      const literal: unknown = JSON.parse(found.value.value);
      return typeof literal === "string" ? literal : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

const DOUBLE_SPACES = / {2,}/g;
const SPACE_BEFORE_PUNCTUATION = / ([,.;:!?])/g;

/**
 * Joins text nodes that became adjacent because a node between them was
 * dropped, and repairs the whitespace that dropping it left behind.
 */
function withMergedText(nodes: MdxNode[]): MdxNode[] {
  const merged: MdxNode[] = [];
  for (const node of nodes) {
    const previous = merged.at(-1);
    if (node.type === "text" && previous?.type === "text") {
      previous.value = `${previous.value}${node.value}`
        .replace(DOUBLE_SPACES, " ")
        .replace(SPACE_BEFORE_PUNCTUATION, "$1");
      continue;
    }
    // A hard line break replaces the spaces around it.
    if (node.type === "break" && previous?.type === "text") {
      previous.value = previous.value?.trimEnd();
    }
    if (node.type === "text" && previous?.type === "break") {
      merged.push({ ...node, value: node.value?.trimStart() });
      continue;
    }
    merged.push(node.type === "text" ? { ...node } : node);
  }
  return merged;
}

function text(value: string): MdxNode {
  return { type: "text", value };
}

function paragraph(value: string): MdxNode {
  return { type: "paragraph", children: [text(value)] };
}
