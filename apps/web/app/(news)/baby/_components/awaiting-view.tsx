import BabyName from "./baby-name";
import { Countdown } from "./countdown";
import { Updates } from "./updates";

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
    </div>
  );
}
