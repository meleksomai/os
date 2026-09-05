import { createRouter } from "@tanstack/react-router";
import { ErrorPage } from "@/components/pages/error-page";
import { NotFoundPage } from "@/components/pages/not-found-page";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    // Preload route loaders on hover/focus so a click renders instantly.
    // `defaultPreloadStaleTime` is intentionally left at the framework
    // default (30s) — overriding it to 0 would invalidate the preloaded
    // data immediately, forcing the click to refetch and defeating the
    // point of intent preload.
    defaultPreload: "intent",
    defaultErrorComponent: ErrorPage,
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: true,
    // How long to hold the previous page before showing
    // `pendingComponent`. Framework default is 1000ms; on Cloudflare
    // with cold-start + bundle download, a typical docs nav exceeds
    // 1s, leaving the user staring at the previous page for the
    // entire wait — the exact "frozen" symptom this branch addresses.
    // 200ms is below the perceptible-delay threshold while still
    // hiding the skeleton on intent-preloaded (instant) navs.
    // `pendingMinMs` (500ms) keeps the skeleton on screen long enough
    // not to strobe when it does fire.
    defaultPendingMs: 200,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
