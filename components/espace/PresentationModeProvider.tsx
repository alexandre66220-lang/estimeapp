"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

type PresentationModeContextValue = {
  active: boolean;
  enable: () => void;
  disable: () => void;
};

const PresentationModeContext = createContext<PresentationModeContextValue>({
  active: false,
  enable: () => {},
  disable: () => {},
});

export function usePresentationMode() {
  return useContext(PresentationModeContext);
}

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function PresentationModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActive(false), INACTIVITY_TIMEOUT_MS);
  }, []);

  const enable = useCallback(() => {
    setActive(true);
    resetTimer();
  }, [resetTimer]);

  const disable = useCallback(() => {
    setActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!active) return;
    const events = ["mousemove", "keydown", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, resetTimer));
  }, [active, resetTimer]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <PresentationModeContext.Provider value={{ active, enable, disable }}>
      {active && <PresentationBanner onQuit={disable} />}
      {children}
    </PresentationModeContext.Provider>
  );
}

function PresentationBanner({ onQuit }: { onQuit: () => void }) {
  return (
    <div
      className="fixed top-0 inset-x-0 z-[200] flex items-center justify-between gap-3 px-4 py-2.5 text-white text-sm font-medium"
      style={{ background: "#C75D3B" }}
    >
      <span className="flex items-center gap-2">
        <Eye size={16} aria-hidden="true" weight="fill" />
        Mode présentation activé — Vos données privées sont masquées
      </span>
      <button
        type="button"
        onClick={onQuit}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded-full px-3 py-1 text-xs font-semibold shrink-0"
      >
        <EyeSlash size={14} aria-hidden="true" />
        Quitter
      </button>
    </div>
  );
}

/** Bouton pour activer le mode présentation — à placer dans le menu ou le dashboard */
export function PresentationModeButton({ className }: { className?: string }) {
  const { active, enable, disable } = usePresentationMode();
  return (
    <button
      type="button"
      onClick={active ? disable : enable}
      className={className}
    >
      <Eye size={20} aria-hidden="true" />
      {active ? "Quitter le mode présentation" : "Mode présentation"}
    </button>
  );
}
