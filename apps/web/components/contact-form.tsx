"use client";

import { Heading2 } from "@workspace/ui/blocks/headings";
import {
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  LoadingIcon,
  MailIcon,
} from "@workspace/ui/components/icons";
import { useReveal } from "@workspace/ui/hooks/use-reveal";
import { cn } from "@workspace/ui/lib/utils";
import { useActionState, useEffect, useRef, useState } from "react";
import { subscribeToNewsletter } from "@/actions/newsletter";

type SubscribeState = "idle" | "loading" | "success" | "error";

const initialState = { success: false, message: "" };

export function ContactForm() {
  const { ref, isVisible } = useReveal(0.3);

  const [actionState, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    initialState
  );
  const [email, setEmail] = useState("");
  const [displayState, setDisplayState] = useState<SubscribeState>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPending) {
      setDisplayState("loading");
    } else if (actionState.message) {
      setDisplayState(actionState.success ? "success" : "error");
    }
  }, [isPending, actionState]);

  const handleReset = () => {
    setDisplayState("idle");
    setEmail("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (displayState === "error") {
      const timer = setTimeout(() => setDisplayState("idle"), 4000);
      return () => clearTimeout(timer);
    }
  }, [displayState]);

  return (
    <section className="items-center" ref={ref}>
      <div className="w-full">
        <div className="flex flex-col justify-center">
          <div
            className={`mb-6 transition-all duration-700 md:mb-12 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-12 opacity-0"
            }`}
          >
            <Heading2>Let's talk</Heading2>
            <p className="font-mono text-muted-foreground text-xs uppercase md:text-base">
              / Get in touch
            </p>
          </div>

          <div className="space-y-4 md:space-y-8">
            <a
              className={`group block transition-all duration-700 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-16 opacity-0"
              }`}
              href="mailto:hello@somai.me"
              style={{ transitionDelay: "200ms" }}
            >
              <div className="mb-1 flex items-center gap-2">
                <MailIcon className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-muted-foreground text-xs">
                  Email
                </span>
              </div>
              <p className="text-base text-foreground transition-colors group-hover:text-foreground/70 md:text-2xl">
                hello@somai.me
              </p>
            </a>
          </div>
          <p
            className={cn(
              "mt-8 mb-2 text-base text-muted-foreground transition-all duration-700 md:text-lg",
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-14 opacity-0"
            )}
            style={{ transitionDelay: "100ms" }}
          >
            Join the newsletter for updates on my work and writings.
          </p>

          <div
            className={cn(
              "mb-8 transition-all duration-700 md:mb-10",
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-16 opacity-0"
            )}
            style={{ transitionDelay: "150ms" }}
          >
            {/* State: Idle or Loading */}
            <div
              className={cn(
                "transition-all duration-500",
                displayState === "success" || displayState === "error"
                  ? "pointer-events-none h-0 -translate-y-4 opacity-0"
                  : "h-auto translate-y-0 opacity-100"
              )}
            >
              <form action={formAction}>
                <div className="flex w-full flex-col gap-3 sm:w-md sm:flex-row sm:items-center sm:gap-0 sm:border sm:border-border sm:bg-background sm:p-1.5 sm:pl-5">
                  <input
                    className={cn(
                      "flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60",
                      "border border-border px-4 py-3 sm:border-0 sm:px-0 sm:py-2",
                      "transition-opacity duration-300",
                      displayState === "loading" && "opacity-50"
                    )}
                    disabled={displayState === "loading"}
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="What's your email?"
                    ref={inputRef}
                    required
                    type="email"
                    value={email}
                  />

                  <button
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-300",
                      "bg-foreground text-background",
                      "hover:bg-foreground/90 active:scale-[0.98]",
                      "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-foreground",
                      "sm:py-2.5"
                    )}
                    disabled={!email || displayState === "loading"}
                    type="submit"
                  >
                    {displayState === "loading" ? (
                      <>
                        <LoadingIcon className="h-4 w-4 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <span>Get updates</span>
                    )}
                  </button>
                </div>
              </form>
              <p className="mt-2 text-muted-foreground text-xs">
                No spam, just updates. Unsubscribe anytime.
              </p>
            </div>

            {/* State: Success */}
            <div
              className={cn(
                "transition-all duration-500",
                displayState === "success"
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none absolute translate-y-4 opacity-0"
              )}
            >
              <div className="border border-border bg-background p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-foreground text-background">
                    <CheckIcon
                      className={cn(
                        "h-5 w-5",
                        displayState === "success" &&
                          "zoom-in animate-in duration-300"
                      )}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">
                      You're on the list!
                    </p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      We'll send updates to{" "}
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  className="group mt-4 flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                  onClick={handleReset}
                  type="button"
                >
                  <span>Subscribe another email</span>
                  <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* State: Error */}
            <div
              className={cn(
                "transition-all duration-500",
                displayState === "error"
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none absolute translate-y-4 opacity-0"
              )}
            >
              <div className="border border-destructive/30 bg-destructive/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-destructive/10 text-destructive">
                    <CloseIcon
                      className={cn(
                        "h-5 w-5",
                        displayState === "error" &&
                          "zoom-in animate-in duration-300"
                      )}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">
                      Something went wrong
                    </p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {actionState.message || "Please try again in a moment"}
                    </p>
                  </div>
                </div>

                <button
                  className="group mt-4 flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                  onClick={handleReset}
                  type="button"
                >
                  <span>Try again</span>
                  <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
