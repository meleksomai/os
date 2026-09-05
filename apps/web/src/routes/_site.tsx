import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/components/common/footer";
import Navbar from "@/components/common/navbar";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-16">
      <Navbar />
      <div className="relative bg-background text-foreground">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
