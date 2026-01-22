import { isBabyBorn } from "@workspace/flags";
import { ThemeSwitcher } from "@workspace/ui/blocks/theme-switcher";
import { AwaitingView } from "./_components/awaiting-view";
import { BornView } from "./_components/born-view";
import { FloatingAnimals } from "./_components/floating-animals";

export default async function BabyNewsPage() {
  const IS_BORN = await isBabyBorn();

  return (
    <div className="relative min-h-[100vh]">
      <FloatingAnimals />

      {/* Content scrolls with page, centered in first viewport */}
      <div className="flex items-center justify-center">
        <ThemeSwitcher />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        {IS_BORN ? <BornView /> : <AwaitingView />}
      </div>
    </div>
  );
}
