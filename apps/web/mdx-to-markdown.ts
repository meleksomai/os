import type { Root, RootContent } from "mdast";
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
  const tree = parser.parse(source);
  const markdownTree: Root = {
    type: "root",
    children: tree.children.flatMap((child) =>
      toMarkdownNodes(child as MdxNode)
    ) as RootContent[],
  };
  return stringifier.stringify(markdownTree).trim();
}

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);

const stringifier = unified()
  .use(remarkGfm)
  .use(remarkStringify, { bullet: "-", fences: true, listItemIndent: "one" });

/** The node types remark-mdx adds to mdast, loosely typed. */
interface MdxNode {
  type: string;
  name?: string | null;
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: MdxNode[];
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
    return [{ ...node, children: node.children.flatMap(toMarkdownNodes) }];
  }
  return [node];
}

/**
 * The markdown equivalent of a JSX component: `<Quote>` becomes a blockquote
 * with an attribution line, anything with a `src` an image, and everything
 * else what it wraps (so a self-closing component disappears).
 */
function componentToMarkdown(node: MdxNode): MdxNode[] {
  const children = (node.children ?? []).flatMap(toMarkdownNodes);

  if (node.name === "Quote") {
    const attribution = [attribute(node, "author"), attribute(node, "source")]
      .filter(Boolean)
      .join(", ");
    if (attribution) {
      children.push(paragraph(`— ${attribution}`));
    }
    return [{ type: "blockquote", children }];
  }

  const src = attribute(node, "src");
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

function attribute(node: MdxNode, name: string): string | undefined {
  const found = node.attributes?.find(
    (candidate) =>
      candidate.type === "mdxJsxAttribute" && candidate.name === name
  );
  return typeof found?.value === "string" ? found.value : undefined;
}

function paragraph(value: string): MdxNode {
  return { type: "paragraph", children: [{ type: "text", value } as MdxNode] };
}
