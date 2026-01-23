import { enableShareWishes, isBabyBorn } from "@workspace/flags";
import { ThemeSwitcher } from "@workspace/ui/blocks/theme-switcher";
import { LoveIcon } from "@workspace/ui/components/icons";
import { AwaitingView } from "./_components/awaiting-view";
import { BornView } from "./_components/born-view";
import { FloatingAnimals } from "./_components/floating-animals";
import { SignBook } from "./_components/signbook";
import { Updates } from "./_components/updates";

export default async function BabyNewsPage() {
  const IS_BORN = await isBabyBorn();
  const isShareWishesEnabled = await enableShareWishes();

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <div className="flex items-center justify-end py-8 md:py-12 lg:py-16 px-6 sm:px-8 lg:px-16">
        <ThemeSwitcher />
      </div>
      <FloatingAnimals />
      <div className="px-6 sm:px-8 lg:px-16 relative z-10 flex flex-col items-center justify-center py-20 md:py-24 lg:py-32 max-w-4xl mx-auto">
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
      <footer className="relative z-10 mt-auto px-6 pb-8 text-center sm:px-8 lg:px-16">
        <p className="font-mono text-xs text-muted-foreground">
          Made with <LoveIcon className="inline-block w-4 h-4 text-red-500" />{" "}
          by the parents Imen and Melek from Binghamton, NY on January 2025.
        </p>
      </footer>
    </div>
  );
}
