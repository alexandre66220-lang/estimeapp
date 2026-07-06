"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { ACTIONS_POINTS, type ActionFidelite } from "@/lib/fidelite/constants";

type ToastEntry = {
  id: number;
  action: ActionFidelite;
  points: number;
  leveledUp?: boolean;
};

type PointsToastContextType = {
  notify: (action: ActionFidelite, points: number, leveledUp?: boolean) => void;
};

const PointsToastContext = createContext<PointsToastContextType>({
  notify: () => {},
});

export function usePointsToast() {
  return useContext(PointsToastContext);
}

let nextId = 0;

export function PointsToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const notify = useCallback(
    (action: ActionFidelite, points: number, leveledUp = false) => {
      const id = ++nextId;
      setToasts((prev) => [...prev.slice(-3), { id, action, points, leveledUp }]);
      const timer = setTimeout(() => dismiss(id), 4000);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const timersRef = timers.current;
    return () => { timersRef.forEach(clearTimeout); };
  }, []);

  return (
    <PointsToastContext.Provider value={{ notify }}>
      {children}
      <div
        className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <PointsToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </PointsToastContext.Provider>
  );
}

function PointsToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastEntry;
  onDismiss: () => void;
}) {
  const label = ACTIONS_POINTS[toast.action]?.label ?? toast.action;

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 bg-dusk text-dust text-sm px-4 py-3 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2 duration-300"
      style={{ maxWidth: 320 }}
    >
      <span className="text-base shrink-0">
        {toast.leveledUp ? "🎉" : "⚡"}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-ambre">+{toast.points} points</p>
        <p className="text-dust/70 text-xs truncate">{label}</p>
        {toast.leveledUp && (
          <p className="text-xs text-braise font-semibold mt-0.5">Nouveau niveau débloqué !</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer"
        className="shrink-0 text-dust/40 hover:text-dust transition-colors ml-1"
      >
        ×
      </button>
    </div>
  );
}
