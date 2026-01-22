import { Quote } from "@workspace/ui/blocks/quote";
import type { CSSProperties } from "react";
import { getPublicWishes } from "@/actions/wishes";

export async function WishesBanner() {
  const wishes = await getPublicWishes();

  if (wishes.length === 0) return null;

  const hasMultipleWishes = wishes.length > 1;
  const formatWishDate = (dateString: string) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
      new Date(dateString)
    );

  return (
    <div
      className="mx-auto flex max-w-4xl items-center justify-center py-3"
      style={
        {
          "--item-count": wishes.length,
          "--item-duration": "3s",
        } as CSSProperties
      }
    >
      <div className="relative h-24 w-[min(36rem,80vw)] max-w-full overflow-hidden md:h-28">
        {wishes.map((wish, index) => (
          <div
            className={
              hasMultipleWishes
                ? "wish-rolodex-item"
                : "wish-rolodex-item is-static"
            }
            key={wish.id}
            style={
              {
                "--item-index": index,
              } as CSSProperties
            }
          >
            <Quote
              author={wish.name}
              className="max-w-full"
              size="compact"
              source={formatWishDate(wish.created_at)}
            >
              {wish.message}
            </Quote>
          </div>
        ))}
      </div>
    </div>
  );
}
