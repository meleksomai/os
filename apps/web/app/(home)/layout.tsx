import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-16">
      <Navbar />
      <div className="relative bg-background text-foreground">{children}</div>
      <Footer />
    </div>
  );
}
