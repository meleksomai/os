import { Link } from "@tanstack/react-router";
import { Heading2, Heading4 } from "@workspace/ui/blocks/headings";
import type { EssayListItem } from "@/server/essays/schema";

export const EssaysSection = ({ posts }: { posts: EssayListItem[] }) => (
  <div className="flex flex-col gap-4">
    {posts.map((post) => (
      <Link
        className="group flex cursor-pointer flex-col justify-between gap-2 border-foreground/10 border-b py-6 transition-all duration-700 hover:border-foreground/20 md:py-8"
        key={post.slug}
        params={{ slug: post.slug }}
        to="/essay/$slug"
      >
        <Heading2 className="mr-12 mb-1 transition-transform duration-300 group-hover:translate-x-2">
          {post.metadata.title}
        </Heading2>
        <Heading4 className="font-mono text-muted-foreground uppercase">
          {post.metadata.subtitle}
        </Heading4>
        <p className="font-mono text-muted-foreground text-xs uppercase md:text-sm">
          / {post.metadata.publishedAtFormatted} / {post.readingTime.text} /{" "}
          {post.readingTime.words} words
        </p>
      </Link>
    ))}
  </div>
);
