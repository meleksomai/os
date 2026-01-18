import { getBlogEssays, getRawEssayMarkdown } from "../../../utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const markdown = await getRawEssayMarkdown(slug);

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch {
    return new Response("Essay not found", { status: 404 });
  }
}

export async function generateStaticParams() {
  const essays = await getBlogEssays();
  return essays.map((essay) => ({ slug: essay.slug }));
}

export const dynamicParams = false;
