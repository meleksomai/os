import { describe, expect, it } from "vitest";
import { mdxToMarkdown, plainText } from "../../mdx-to-markdown";

describe("mdxToMarkdown", () => {
  it("drops import statements and expressions, keeps the prose", () => {
    const markdown =
      mdxToMarkdown(`import { Quote } from "@workspace/ui/blocks/quote";

Hello {new Date().getFullYear()} world.

## A heading

- one
- two
`);

    expect(markdown).toBe(`Hello world.

## A heading

- one
- two`);
  });

  it("turns a Quote into a blockquote with its attribution, however the attributes are written", () => {
    const markdown =
      mdxToMarkdown(`<Quote author={"Norbert Wiener"} source="The Human Use of Human Beings">
Any machine constructed for the purpose of making decisions.
</Quote>`);

    expect(
      markdown
    ).toBe(`> Any machine constructed for the purpose of making decisions.
>
> — Norbert Wiener, The Human Use of Human Beings`);
  });

  it("turns a themed image into an image and a RelativeTime into its date", () => {
    const markdown = mdxToMarkdown(
      `<ThemeImage lightSrc="/images/a_light.png" darkSrc="/images/a_dark.png" alt="Diagram" width={800} />

Over the holidays <RelativeTime date={"2025-12-24"} />, I built it.`
    );

    expect(markdown).toBe(`![Diagram](/images/a_light.png)

Over the holidays 2025-12-24, I built it.`);
  });

  it("removes icons and tooltips without leaving stray spaces, and keeps line breaks", () => {
    const markdown = mdxToMarkdown(
      `Available <GitHubIcon className="inline-block" /> [here](https://example.com) for <Highlight text="tooltip">EHRs</Highlight> — see <XIcon />.

First line <br /> second line.`
    );

    expect(markdown).toBe(`Available [here](https://example.com) for EHRs — see.

First line\\
second line.`);
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

describe("plainText", () => {
  it("strips the markdown syntax so reading time counts words only", () => {
    expect(plainText("# Title\n\n- *one* [two](https://x.y)\n\n> three")).toBe(
      "Title\none two\nthree"
    );
  });
});
