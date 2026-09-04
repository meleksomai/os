import { Heading1, Heading2 } from "@workspace/ui/blocks/headings";

export const HeaderSection = () => (
  <div className="flex flex-col gap-4">
    <Heading1>Essays</Heading1>
    <Heading2 className="font-mono text-muted-foreground">
      A SPACE TO SHARE THOUGHTS AND IDEAS THAT ARE OFTEN REFLECTIONS ON MY
      CURRENT RESEARCH.
    </Heading2>
  </div>
);
