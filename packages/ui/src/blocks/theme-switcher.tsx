"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { ComputerIcon, MoonIcon, SunIcon } from "../components/icons";
import { cn } from "../lib/utils";

const themes = [
  {
    key: "system",
    icon: ComputerIcon,
    label: "System theme",
  },
  {
    key: "light",
    icon: SunIcon,
    label: "Light theme",
  },
  {
    key: "dark",
    icon: MoonIcon,
    label: "Dark theme",
  },
];
export interface ThemeSwitcherProps {
  className?: string;
}
export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // set to false initially to prevent hydration mismatch

  const handleThemeClick = useCallback(
    (themeKey: string) => {
      setTheme(themeKey);
    },
    [setTheme]
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  return (
    <div
      className={cn(
        "relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border",
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;
        return (
          <button
            aria-label={label}
            className={cn(
              "relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:text-foreground",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
            key={key}
            onClick={() => handleThemeClick(key)}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-full bg-secondary"
                layoutId="activeTheme"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
};
