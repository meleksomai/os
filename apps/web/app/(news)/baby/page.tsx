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
    <div className="flex min-h-screen flex-col gap-8 overflow-hidden">
      <div className="flex items-center justify-end px-6 py-8 sm:px-8 md:py-12 lg:px-16 lg:py-16">
        <ThemeSwitcher />
      </div>
      <FloatingAnimals />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center gap-12 px-6 py-20 sm:px-8 md:py-24 lg:px-16 lg:py-32">
        {IS_BORN ? <BornView /> : <AwaitingView />}
        <p className="py-4 text-center font-serif text-2xl text-muted-foreground italic md:py-8">
          Proud parents Imen &amp; Melek
        </p>
        {isShareWishesEnabled ? (
          <div className="flex flex-col items-center justify-center">
            <SignBook />
          </div>
        ) : null}
        <div className="pt-12 md:pt-18">
          <Updates />
        </div>
      </div>
      <footer className="relative z-10 mt-auto px-6 py-8 text-center sm:px-8 lg:px-16">
        <p className="font-mono text-muted-foreground text-xs">
          Made with <LoveIcon className="inline-block h-4 w-4 text-red-500" />{" "}
          by the parents Imen and Melek from Binghamton, NY on January 2025.
        </p>
      </footer>
    </div>
  );
}
