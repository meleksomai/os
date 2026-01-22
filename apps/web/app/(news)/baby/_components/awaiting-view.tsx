import BabyName from "./baby-name";
import { Countdown } from "./countdown";

export function AwaitingView() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
        We are looking forward
      </p>

      <BabyName />

      <div className="my-4">
        <Countdown />
      </div>

      <p className="font-serif text-2xl italic text-muted-foreground">
        Proud parents Imen &amp; Melek
      </p>
    </div>
  );
}
