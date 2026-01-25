"use client";

import copy from "clipboard-copy";
// biome-ignore lint/performance/noNamespaceImport: fine
import * as React from "react";

import { Button } from "../components/button";
import { CheckIcon, CopyIcon } from "../components/icons";
import { ScrollArea, ScrollBar } from "../components/scroll-area";
import { cn } from "../lib/utils";

interface CodeBlockCtx {
  codeId: string;
  titleId: string;
}
const CodeBlockContext = React.createContext<CodeBlockCtx>({
  codeId: "",
  titleId: "",
});

export function Root({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const titleId = React.useId();
  const codeId = React.useId();

  const context = React.useMemo(() => ({ codeId, titleId }), [codeId, titleId]);

  return (
    <CodeBlockContext.Provider value={context}>
      <figure
        aria-labelledby={titleId}
        {...props}
        className={cn(
          // From .CodeBlockRoot :contentReference[oaicite:1]{index=1}
          "self-stretch rounded-md border border-border bg-background",
          // Equivalent spacing: margin-top spacing*5, margin-bottom spacing*6
          "mt-5 mb-6",
          className
        )}
      />
    </CodeBlockContext.Provider>
  );
}

export function Panel({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { codeId, titleId } = React.useContext(CodeBlockContext);
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function onCopy() {
    const code = document.getElementById(codeId)?.textContent;
    if (!code) return;

    await copy(code);
    setCopied(true);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopied(false);
      timerRef.current = null;
    }, 2000);
  }

  return (
    <div
      {...props}
      className={cn(
        // From .CodeBlockPanel :contentReference[oaicite:2]{index=2}
        "flex h-9 items-center justify-between whitespace-nowrap px-3 text-xs leading-none",
        "rounded-t-md border-border border-b bg-muted text-muted-foreground",
        // Scroll: overflow-x, hide scrollbars
        "overflow-x-auto overflow-y-hidden overscroll-x-contain",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // Focus ring when panel is focusable (e.g., scroll container)
        "focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-1px]",
        className
      )}
    >
      <div
        className={cn(
          // From .CodeBlockPanelTitle :contentReference[oaicite:3]{index=3}
          "font-normal text-foreground/80 text-sm"
        )}
        id={titleId}
      >
        {children}
      </div>

      <Button
        aria-label="Copy code"
        className="ml-auto inline-flex items-center gap-2"
        onClick={onCopy}
        type="button"
        variant="ghost"
      >
        Copy
        <span className="flex size-[14px] items-center justify-center">
          {copied ? <CheckIcon /> : <CopyIcon />}
        </span>
      </Button>
    </div>
  );
}

export function Pre({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"pre">) {
  const { codeId } = React.useContext(CodeBlockContext);

  return (
    <ScrollArea
      className="outline-none"
      // From .CodeBlockPreContainer :contentReference[oaicite:4]{index=4}
      onKeyDown={(event) => {
        const isCtrlA =
          (event.ctrlKey || event.metaKey) &&
          String.fromCharCode(event.keyCode) === "A" &&
          !event.shiftKey &&
          !event.altKey;

        if (isCtrlA) {
          event.preventDefault();
          window.getSelection()?.selectAllChildren(event.currentTarget);
        }
      }}
      // Select contents on Ctrl/Cmd + A (only within the code block)
      tabIndex={-1}
    >
      <pre
        id={codeId}
        {...props}
        className={cn(
          // From .CodeBlockPre :contentReference[oaicite:5]{index=5}
          "cursor-text rounded-md bg-background text-foreground text-xs leading-5 outline-none",
          "py-2",
          // Scroll behavior inside the <pre>
          "flex overflow-auto overscroll-x-contain",
          // Ensure selection / layout behavior on nested code
          "[&>code]:block [&>code]:grow",
          className
        )}
      />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function Code({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      {...props}
      className={cn(
        // .Code { letter-spacing: normal; }
        "tracking-normal",

        // pre & { white-space: normal; }
        // Tailwind arbitrary selector: apply when this <code> is inside a <pre>
        "[pre_&]:whitespace-normal",

        // & [data-line] { display: block; white-space: pre; padding-inline: 0.75rem; }
        "[&_[data-line]]:block",
        "[&_[data-line]]:whitespace-pre",
        "[&_[data-line]]:px-3",

        // & [data-line]:empty { height: 1lh; }
        "[&_[data-line]:empty]:h-[1lh]",

        // & mark { display: inline-block; }
        "[&_mark]:inline-block",

        className
      )}
    />
  );
}
