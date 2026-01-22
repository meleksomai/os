import { getPublicWishes } from "@/actions/wishes";

export async function WishesBanner() {
  const wishes = await getPublicWishes();

  if (wishes.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="animate-marquee flex whitespace-nowrap py-3">
        {wishes.map((wish) => (
          <span
            className="mx-8 inline-flex items-center gap-2 text-sm"
            key={wish.id}
          >
            <span className="text-muted-foreground">{wish.name}:</span>
            <span className="text-foreground">
              &ldquo;{wish.message}&rdquo;
            </span>
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {wishes.map((wish) => (
          <span
            className="mx-8 inline-flex items-center gap-2 text-sm"
            key={`${wish.id}-dup`}
          >
            <span className="text-muted-foreground">{wish.name}:</span>
            <span className="text-foreground">
              &ldquo;{wish.message}&rdquo;
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
