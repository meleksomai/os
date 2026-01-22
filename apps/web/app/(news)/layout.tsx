import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function NewsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed inset-0 overflow-auto bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-16">
        <Navbar />
        <div className="relative">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
