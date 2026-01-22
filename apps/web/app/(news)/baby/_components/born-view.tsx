import BabyName from "./baby-name";

interface BirthDetails {
  date: string;
  time: string;
  weight: string;
  height: string;
}

const BIRTH_DETAILS: BirthDetails = {
  date: "January 26, 2026",
  time: "00:00",
  weight: "0.0 kg",
  height: "00 cm",
};

export function BornView() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
        Welcome to the world
      </p>

      <BabyName />

      <div className="my-4 flex flex-col items-center gap-6">
        <p className="font-serif text-2xl italic text-foreground/80">
          She&apos;s here!
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex flex-col items-center">
            <span className="font-serif text-xl">{BIRTH_DETAILS.date}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Born on
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-xl">{BIRTH_DETAILS.time}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              At
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-xl">{BIRTH_DETAILS.weight}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Weight
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-xl">{BIRTH_DETAILS.height}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Height
            </span>
          </div>
        </div>
      </div>

      <p className="font-serif text-lg italic text-muted-foreground">
        Proud parents Imen &amp; Melek
      </p>
    </div>
  );
}
