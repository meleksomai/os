import { Heading1 } from "@workspace/ui/blocks/headings";
import { useReveal } from "@workspace/ui/hooks/use-reveal";
import { siteConfig } from "@/config/site";

export default function IntroSection() {
  const { ref, isVisible } = useReveal(0.3);

  return (
    <section className="w-full gap-12 sm:gap-16" ref={ref}>
      <div className="space-y-6 sm:space-y-8">
        <div
          className={`mb-6 transition-all duration-700 md:mb-12 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-12 opacity-0"
          }`}
        >
          <p className="font-mono text-muted-foreground text-xs uppercase md:text-base">
            / Hi, I AM
          </p>
          <Heading1>
            Melek
            <br />
            <span className="text-muted-foreground">Somai</span>
          </Heading1>
        </div>

        <div
          className={`space-y-3 transition-all duration-700 md:space-y-4 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <p className="text-muted-foreground text-xl leading-relaxed md:text-2xl lg:text-3xl">
            I am a <span className="text-foreground"> physician</span>, and{" "}
            <span className="text-foreground"> clinical informatician</span>. I
            am currently the{" "}
            <span className="text-foreground">
              {" "}
              chief product & technology officer
            </span>
            , at Froedtert Thedacare.
          </p>
          <p className="text-muted-foreground text-xl leading-relaxed md:text-2xl lg:text-3xl">
            I work at the intersection of{" "}
            <span className="text-foreground">digital health</span>,
            <span className="text-foreground"> AI</span>, and
            <span className="text-foreground"> software engineering</span>.
          </p>

          <div
            className={`flex gap-4 pt-2 transition-all duration-700 md:pt-4 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            {siteConfig.social.map((social) => (
              <a
                className="border-transparent border-b font-mono text-muted-foreground text-xs transition-all hover:border-foreground/60 hover:text-foreground/90 md:text-sm"
                href={social.href}
                key={social.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
