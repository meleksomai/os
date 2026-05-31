import { useEffect, useState } from "react";

// Due date: January 26, 2026 at midnight local time
const DUE_DATE = new Date(2026, 0, 26, 0, 0, 0);

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const COUNTDOWN_INTERVAL_MS = 1000;

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft | null {
  const now = new Date();
  const difference = DUE_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / MS_PER_DAY),
    hours: Math.floor((difference / MS_PER_HOUR) % HOURS_PER_DAY),
    minutes: Math.floor((difference / MS_PER_MINUTE) % MINUTES_PER_HOUR),
    seconds: Math.floor((difference / MS_PER_SECOND) % SECONDS_PER_MINUTE),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 sm:h-20 sm:w-20">
        <span className="font-serif text-3xl sm:text-4xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
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
    }, COUNTDOWN_INTERVAL_MS);

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
        <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
          Scheduled Delivery
        </p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="font-serif text-2xl text-foreground/80 italic">
          Anytime soon...
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
      <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
        Scheduled Delivery
      </p>
    </div>
  );
}
