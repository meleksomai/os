import { Countdown } from "./countdown";

export function AwaitingView() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
        We are looking forward
      </p>

      <h1 className="font-serif text-5xl leading-tight sm:text-6xl md:text-7xl">
        Sarah
        <br />
        <span className="text-muted-foreground">Somai</span>
      </h1>

      <div className="my-4">
        <Countdown />
      </div>

      <p className="font-serif text-lg italic text-muted-foreground">
        Proud parents Imen &amp; Melek
      </p>
    </div>
  );
}
