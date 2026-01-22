"use client";

import { useEffect, useState } from "react";

const DUE_DATE = new Date("2025-01-26T00:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft | null {
  const difference = DUE_DATE.getTime() - Date.now();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm sm:h-20 sm:w-20">
        <span className="font-serif text-3xl sm:text-4xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3 sm:gap-4">
          {["Days", "Hours", "Min", "Sec"].map((label) => (
            <TimeBlock key={label} label={label} value={0} />
          ))}
        </div>
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Status: In Progress
        </p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="font-serif text-2xl italic text-foreground/80">
          Anytime soon...
        </p>
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Status: In Progress
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3 sm:gap-4">
        <TimeBlock label="Days" value={timeLeft.days} />
        <TimeBlock label="Hours" value={timeLeft.hours} />
        <TimeBlock label="Min" value={timeLeft.minutes} />
        <TimeBlock label="Sec" value={timeLeft.seconds} />
      </div>
      <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
        Status: In Progress
      </p>
    </div>
  );
}
