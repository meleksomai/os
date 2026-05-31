import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

// Shared chrome for the flat /, /essays, /papers routes — replaces the
// identical Next route-group layouts ((home)/(blog)/(research)). Padding and
// the inner background wrapper are preserved verbatim from those layouts.
export function Chrome({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-16">
      <Navbar />
      <div className="relative bg-background text-foreground">{children}</div>
      <Footer />
    </div>
  );
}
