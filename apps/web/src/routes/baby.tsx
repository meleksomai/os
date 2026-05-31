import { createFileRoute } from "@tanstack/react-router";
import { enableShareWishes } from "@workspace/flags";
import { ThemeSwitcher } from "@workspace/ui/blocks/theme-switcher";
import { LoveIcon } from "@workspace/ui/components/icons";
import { BornView } from "../components/baby/born-view";
import { FloatingAnimals } from "../components/baby/floating-animals";
import { SignBook } from "../components/baby/signbook";

const TITLE = "Melek Somai | Welcome Baby Sarah";
const DESCRIPTION =
  "Welcome to the world, Sarah Janet Somai. Share your wishes with the proud parents Imen and Melek.";

export const Route = createFileRoute("/baby")({
  // Resolve the portable env-driven flag server-side; pass the boolean to the UI.
  loader: () => enableShareWishes(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: "/og/baby.png" },
      { name: "twitter:image", content: "/og/baby.png" },
    ],
  }),
  component: BabyPage,
});

function BabyPage() {
  const isShareWishesEnabled = Route.useLoaderData();

  return (
    // No navbar/footer chrome — full-bleed news layout.
    <div className="mx-auto">
      <div className="relative bg-background text-foreground">
        <div className="flex min-h-screen flex-col gap-8 overflow-hidden">
          <div className="flex items-center justify-end px-6 py-8 sm:px-8 md:py-12 lg:px-16 lg:py-16">
            <ThemeSwitcher />
          </div>
          <FloatingAnimals />
          <div className="relative z-10 mx-auto flex w-full flex-col items-center justify-center gap-12 px-6 py-20 sm:px-8 md:py-24 lg:px-16 lg:py-32">
            <BornView />
            <p className="py-4 text-center font-serif text-2xl text-muted-foreground italic md:py-8">
              Proud parents Imen &amp; Melek
            </p>
            {isShareWishesEnabled ? (
              <div className="flex flex-col items-center justify-center">
                <SignBook />
              </div>
            ) : null}
          </div>
          <footer className="relative z-10 mt-auto px-6 py-8 text-center sm:px-8 lg:px-16">
            <p className="font-mono text-muted-foreground text-xs">
              Made with{" "}
              <LoveIcon className="inline-block h-4 w-4 text-red-500" /> by the
              parents Imen and Melek from Binghamton, NY on January 2025.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
