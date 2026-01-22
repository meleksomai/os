import { AwaitingView } from "./_components/awaiting-view";
import { BornView } from "./_components/born-view";
import { FloatingAnimals } from "./_components/floating-animals";

// Toggle this to switch between views
const IS_BORN = false;

export default function BabyNewsPage() {
  return (
    <div className="relative min-h-[100vh]">
      <FloatingAnimals />

      {/* Content scrolls with page, centered in first viewport */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        {IS_BORN ? <BornView /> : <AwaitingView />}
      </div>
    </div>
  );
}
