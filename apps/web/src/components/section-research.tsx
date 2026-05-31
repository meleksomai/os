"use client";

import { Heading2, Heading3 } from "@workspace/ui/blocks/headings";
import { useReveal } from "@workspace/ui/hooks/use-reveal";

export function ResearchSection() {
  const { ref, isVisible } = useReveal(0.4);

  return (
    <section className="flex shrink-0 snap-start items-center" ref={ref}>
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-12 opacity-0"
          }`}
        >
          <Heading2>Research</Heading2>
          <p className="font-mono text-muted-foreground text-sm uppercase md:text-base">
            / Research in areas ranging from Clinical Computing, Patient Remote
            Monitoring, Neuro-Epidemiology, to AI and Machine Learning.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-12 lg:gap-x-24">
          {[
            {
              title:
                "Augmenting Large Language Models via Vector Embeddings to Improve Domain-specific Responsiveness",
              description:
                "Published in Journal of Visualized Experiments on December 6, 2024",
              direction: "top",
              key: "creative-development",
            },
            {
              title:
                "Scaling Care Coordination Through Digital Engagement: Stepped-Wedge Trial Assessing Readmissions",
              description:
                "Published in The American Journal of Managed Care on February 14, 2024",
              direction: "right",
              key: "visual-design",
            },
            {
              title:
                "Causal inference in medical records and complementary systems pharmacology for metformin drug repurposing towards dementia",
              description:
                "Published in Nature Communications on December 10, 2022",
              direction: "left",
              key: "motion-animation",
            },
            {
              title:
                "Bugs in the Virtual Clinic: Confronting Telemedicine’s Challenges Through Empathy and Support",
              description:
                "Building scalable solutions that perform beautifully",
              direction: "bottom",
              key: "technical-strategy",
            },
          ].map((service, i) => (
            <ServiceCard
              index={i}
              isVisible={isVisible}
              key={service.key}
              service={service}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  isVisible,
}: {
  service: { title: string; description: string; direction: string };
  index: number;
  isVisible: boolean;
}) {
  const getRevealClass = () => {
    if (!isVisible) {
      switch (service.direction) {
        case "left":
          return "-translate-x-16 opacity-0";
        case "right":
          return "translate-x-16 opacity-0";
        case "top":
          return "-translate-y-16 opacity-0";
        case "bottom":
          return "translate-y-16 opacity-0";
        default:
          return "translate-y-12 opacity-0";
      }
    }
    return "translate-x-0 translate-y-0 opacity-100";
  };

  return (
    <div
      className={`group cursor-pointer transition-all duration-700 ${getRevealClass()}`}
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="h-px w-8 bg-muted-foreground transition-all duration-300 group-hover:w-12 group-hover:bg-foreground/50" />
        <span className="font-mono text-muted-foreground text-xs">
          0{index + 1}
        </span>
      </div>
      <Heading3>{service.title}</Heading3>
      <p className="max-w-sm text-foreground/80 text-sm leading-relaxed md:text-base">
        {service.description}
      </p>
    </div>
  );
}
