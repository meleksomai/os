"use client";

import { ExpandableImage } from "@workspace/ui/blocks/expandable-image";
import BabyName from "./baby-name";

interface BirthDetails {
  date: string;
  time: string;
  weight: string;
}

const BIRTH_DETAILS: BirthDetails = {
  date: "January 27, 2026",
  time: "03:35 P.M.",
  weight: "3.0 kg",
};

export function BornView() {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
      <p className="font-mono text-2xl text-muted-foreground uppercase tracking-widest">
        Welcome to the world
      </p>

      <BabyName />

      <div className="my-4 flex flex-col items-center gap-6">
        <p className="font-serif text-2xl text-foreground/80 italic">
          She&apos;s here!
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex flex-col items-center">
            <span className="font-serif text-xl">{BIRTH_DETAILS.date}</span>
            <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
              Born on
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-xl">{BIRTH_DETAILS.time}</span>
            <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
              At
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-xl">{BIRTH_DETAILS.weight}</span>
            <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
              Weight
            </span>
          </div>
        </div>
      </div>

      <ExpandableImage
        alt="Baby Sarah Janet Somai shortly after birth"
        src="https://7civhc6kzuyy90te.public.blob.vercel-storage.com/baby/baby_mon-DRtNwVBsw2DW1rciuXGI4goGpcfHp1"
      />
    </div>
  );
}
