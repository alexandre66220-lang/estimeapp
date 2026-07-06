"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useTransition } from "react";
import { Sun, Moon, Desktop } from "@phosphor-icons/react";
import { saveThemeMode } from "@/app/actions/profil-enrichi";

type Mode = "light" | "dark" | "system";

const OPTIONS: { value: Mode; label: string; Icon: React.ElementType }[] = [
  { value: "light",  label: "Clair",       Icon: Sun },
  { value: "dark",   label: "Sombre",      Icon: Moon },
  { value: "system", label: "Automatique", Icon: Desktop },
];

export function ThemeToggle({ defaultMode }: { defaultMode: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => { setMounted(true); }, []);

  const current = (mounted ? theme : defaultMode) as Mode;

  function handleChange(mode: Mode) {
    setTheme(mode);
    startTransition(() => { saveThemeMode(mode).catch(() => {}); });
  }

  return (
    <div className="flex rounded-xl border border-dusk/12 overflow-hidden bg-dust/50 dark:bg-[#1C1A17] dark:border-[#2E2B27] p-1 gap-1">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleChange(value)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
            current === value
              ? "bg-[var(--color-accent,#C75D3B)] text-white shadow-sm"
              : "text-dusk/60 hover:text-dusk dark:text-[#9C9489] dark:hover:text-[#F8F5F2]"
          }`}
        >
          <Icon size={13} weight={current === value ? "fill" : "regular"} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
