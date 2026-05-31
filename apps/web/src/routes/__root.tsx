/// <reference types="vite/client" />
import { MDXProvider } from "@mdx-js/react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { NotFound } from "../components/not-found";
import { components } from "../mdx-components";
import { Providers } from "../providers";
// Self-hosted fonts (replace next/font/google). Side-effect CSS imports.
import "../fonts";
import "katex/dist/katex.min.css";
import "../styles.css";

const TITLE = "Melek Somai";
const DESCRIPTION =
  "Melek Somai is a physician, scientist, and innovator. He works at the intersection of health care Informatics, Data Science, and Product Engineering.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:creator", content: "@meleksomai" },
      { name: "twitter:site", content: "https://somai.me" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/icon.png" },
      { rel: "apple-touch-icon", href: "/apple-icon.png" },
    ],
  }),
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // suppressHydrationWarning required for next-themes class injection.
    <html lang="en" suppressHydrationWarning>
      {/* biome-ignore lint/style/noHeadElement: TanStack Start owns the full HTML document shell; <head> is required here (not a Next.js app). */}
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <MDXProvider components={components}>
            {children ?? <Outlet />}
          </MDXProvider>
        </Providers>
        {import.meta.env.DEV && (
          <TanStackRouterDevtools position="bottom-right" />
        )}
        <Scripts />
      </body>
    </html>
  );
}
