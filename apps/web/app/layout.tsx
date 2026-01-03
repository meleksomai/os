import { Geist, Geist_Mono, Lora } from "next/font/google";

import "./styles.css";
import { VercelToolbar } from "@vercel/toolbar/next";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Providers } from "@/components/providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["italic", "normal"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-16">
            <Navbar />
            <div className="relative min-h-screen bg-background text-foreground">
              {children}
            </div>
            <Footer />
          </div>
          {!!shouldInjectToolbar && <VercelToolbar />}
        </Providers>
      </body>
    </html>
  );
}
