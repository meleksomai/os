import BabyName from "./baby-name";
import { Countdown } from "./countdown";

export function AwaitingView() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
        We are looking forward
      </p>

      <BabyName />

      <div className="my-4">
        <Countdown />
      </div>
    </div>
  );
}
