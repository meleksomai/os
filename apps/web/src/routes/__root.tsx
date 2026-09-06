import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import Footer from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import { ErrorPage } from "@/components/pages/error-page";
import { NotFoundPage } from "@/components/pages/not-found-page";
import { generateSeo } from "@/lib/seo";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...generateSeo().meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
      { rel: "icon", href: "/icon.png", sizes: "500x500", type: "image/png" },
      {
        rel: "apple-touch-icon",
        href: "/apple-icon.png",
        sizes: "500x500",
        type: "image/png",
      },
    ],
  }),
  errorComponent: ErrorPage,
  notFoundComponent: NotFoundPage,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-16">
        <Navbar />
        <div className="relative bg-background text-foreground">
          <Outlet />
        </div>
        <Footer />
      </div>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableColorScheme
          enableSystem
        >
          {children}
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
