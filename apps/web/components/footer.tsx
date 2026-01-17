import { ThemeSwitcher } from "@workspace/ui/blocks/theme-switcher";
import { ContactForm } from "./contact-form";
import { SubscribeSection } from "./subscribe";

export default function Footer() {
  return (
    <footer className="border-border border-t py-12 sm:py-16">
      <ContactForm />
      <div className="flex flex-row items-start justify-between gap-6 sm:gap-8 lg:items-center">
        <div className="space-y-2">
          <div className="text-muted-foreground text-sm">
            © 2025 Melek Somai. All rights reserved.
          </div>
          <div className="text-muted-foreground text-xs">
            Made with focus from New York, San Francisco, and Tunis.
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}
