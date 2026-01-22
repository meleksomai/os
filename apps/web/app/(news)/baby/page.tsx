import { enableShareWishes, isBabyBorn } from "@workspace/flags";
import { ThemeSwitcher } from "@workspace/ui/blocks/theme-switcher";

import { AwaitingView } from "./_components/awaiting-view";
import { BornView } from "./_components/born-view";
import { FloatingAnimals } from "./_components/floating-animals";
import { SignBook } from "./_components/signbook";
import { Updates } from "./_components/updates";

export default async function BabyNewsPage() {
  const IS_BORN = await isBabyBorn();
  const isShareWishesEnabled = await enableShareWishes();

  return (
    <div className="relative">
      <FloatingAnimals />

      {/* Content scrolls with page, centered in first viewport */}
      <div className="flex items-center justify-center py-8 md:py-12 lg:py-16">
        <ThemeSwitcher />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center py-16">
        {IS_BORN ? <BornView /> : <AwaitingView />}
        <p className="font-serif text-2xl italic text-muted-foreground py-4 md:py-8 text-center">
          Proud parents Imen &amp; Melek
        </p>
        {isShareWishesEnabled ? (
          <div className="flex flex-col justify-center items-center">
            <SignBook />
          </div>
        ) : null}
        <Updates />
      </div>
    </div>
  );
}
