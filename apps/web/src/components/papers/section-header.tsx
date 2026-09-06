import { Heading1, Heading2 } from "@workspace/ui/blocks/headings";

export const HeaderSection = () => (
  <div className="flex flex-col gap-4">
    <Heading1>Papers</Heading1>
    <Heading2 className="font-mono text-muted-foreground uppercase">
      Research in areas ranging from Clinical Computing, Patient Remote
      Monitoring, Neuro-Epidemiology, to AI and Machine Learning
    </Heading2>
  </div>
);
