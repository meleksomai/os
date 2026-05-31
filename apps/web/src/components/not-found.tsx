import { Heading1, Heading2, Heading3 } from "@workspace/ui/blocks/headings";

export function NotFound() {
  return (
    <div className="flex h-dvh flex-col justify-center gap-12">
      <Heading1 className="font-mono">404 - Idea not found</Heading1>
      <Heading2 className="text-muted-foreground">
        Every doctor who deserves to be replaced by a computer ought to be
      </Heading2>
      <Heading3 className="text-muted-foreground">– Dr. Warner Slack</Heading3>
    </div>
  );
}
