"use client";
import { Heading2, Heading3 } from "@workspace/ui/blocks/headings";
import { ArrowRightIcon } from "@workspace/ui/components/icons";
import { useReveal } from "@workspace/ui/hooks/use-reveal";
import Link from "next/link";
import type { Essay } from "@/app/(blog)/utils";

export function EssaySection({ essays }: { essays?: Omit<Essay, "Essay">[] }) {
  const { ref, isVisible } = useReveal(0.2);

  return (
    <section
      className="flex shrink-0 snap-start items-center pt-20 md:pt-0"
      ref={ref}
    >
      <div className="mx-auto w-full">
        <div
          className={`mb-6 transition-all duration-700 md:mb-8 ${
            isVisible
              ? "translate-x-0 opacity-100"
              : "-translate-x-12 opacity-0"
          }`}
        >
          <Heading2>Essays</Heading2>
          <p className="font-mono text-muted-foreground text-xs uppercase md:text-base">
            / A space to share thoughts and ideas that are often reflections on
            my current research.
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {essays?.map((essay, i) => (
            <EssayCard
              essay={essay}
              index={i}
              isVisible={isVisible}
              key={essay.slug}
            />
          ))}
        </div>

        <div
          className={`mt-8 transition-all duration-700 md:mt-12 ${
            isVisible
              ? "translate-x-0 opacity-100"
              : "-translate-x-12 opacity-0"
          }`}
          style={{
            transitionDelay: `${(essays?.length ?? 0) * 150 + 200}ms`,
          }}
        >
          <Link
            className="group inline-flex items-center gap-2 font-mono text-muted-foreground text-sm transition-colors hover:text-foreground md:text-base"
            href="/essays"
          >
            Check All Essays
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function EssayCard({
  essay,
  index,
  isVisible,
}: {
  essay: Omit<Essay, "Essay">;
  index: number;
  isVisible: boolean;
}) {
  const getRevealClass = () => {
    if (!isVisible) {
      return "-translate-x-16 opacity-0";
    }
    return "translate-x-0 opacity-100";
  };

  return (
    <Link
      className={`group flex cursor-pointer items-center justify-between border-foreground/10 border-b py-4 transition-all duration-700 hover:border-foreground/20 md:py-6 ${getRevealClass()}`}
      href={`/essay/${essay.slug}`}
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="flex items-baseline gap-4 md:gap-8">
        <div>
          {/*<h3 className="mr-12 mb-1 font-light font-sans text-2xl text-foreground transition-transform duration-300 group-hover:translate-x-2 md:text-3xl lg:text-4xl">*/}
          <span className="font-mono text-muted-foreground text-xs md:text-sm">
            {essay.metadata.publishedAtFormatted}
          </span>
          <Heading3 className="mr-12 mb-1 transition-transform duration-300 group-hover:translate-x-2">
            {essay.metadata.title}
          </Heading3>
          <p className="font-mono text-foreground/50 text-xs md:text-sm">
            {essay.metadata.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
