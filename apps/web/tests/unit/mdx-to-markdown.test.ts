import { describe, expect, it } from "vitest";
import { mdxToMarkdown } from "../../mdx-to-markdown";

describe("mdxToMarkdown", () => {
  it("drops import statements and expressions, keeps the prose", () => {
    const markdown =
      mdxToMarkdown(`import { Quote } from "@workspace/ui/blocks/quote";

Hello {new Date().getFullYear()} world.

## A heading

- one
- two
`);

    expect(markdown).toBe(`Hello  world.

## A heading

- one
- two`);
  });

  it("turns a Quote into a blockquote with its attribution", () => {
    const markdown =
      mdxToMarkdown(`<Quote author="Norbert Wiener" source="The Human Use of Human Beings">
Any machine constructed for the purpose of making decisions.
</Quote>`);

    expect(
      markdown
    ).toBe(`> Any machine constructed for the purpose of making decisions.
>
> — Norbert Wiener, The Human Use of Human Beings`);
  });

  it("turns a component with a src into an image and unwraps the others", () => {
    const markdown = mdxToMarkdown(
      `<ThemeImage src="/images/a.png" alt="Diagram" />

Look at <Highlight text="tooltip">this</Highlight> and <RelativeTime date={"2025-12-24"} />.`
    );

    expect(markdown).toBe(`![Diagram](/images/a.png)

Look at this and .`);
  });

  it("leaves fenced code untouched, including import lines inside it", () => {
    const source =
      '```ts title="agent.ts"\nimport { Agent } from "agents";\nconst x = <Env>{};\n```';

    expect(mdxToMarkdown(source)).toBe(source);
  });

  it("keeps GFM footnotes", () => {
    const markdown = mdxToMarkdown(`A claim.[^1]

[^1]: The source.`);

    expect(markdown).toBe(`A claim.[^1]

[^1]: The source.`);
  });
});
