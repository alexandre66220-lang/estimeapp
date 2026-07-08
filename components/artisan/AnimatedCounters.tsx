"use client";

import { useEffect, useRef, useState } from "react";

interface Counter {
  label: string;
  value: number;
  suffix: string;
  icon: string;
}

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [active, target, duration]);

  return current;
}

function CounterItem({
  counter,
  active,
  couleur,
  styleVariant,
}: {
  counter: Counter;
  active: boolean;
  couleur: string;
  styleVariant: "bande" | "cards";
}) {
  const val = useCountUp(counter.value, 1800, active);

  if (styleVariant === "bande") {
    return (
      <div className="flex flex-col items-center gap-1 px-6">
        <span className="text-3xl" aria-hidden="true">{counter.icon}</span>
        <span className="text-4xl font-bold tabular-nums text-white">
          {val.toLocaleString("fr-FR")}{counter.suffix}
        </span>
        <span className="text-sm text-white/75">{counter.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#2B2521]/5">
      <span className="text-2xl" aria-hidden="true">{counter.icon}</span>
      <p className="text-3xl font-bold tabular-nums mt-2" style={{ color: couleur }}>
        {val.toLocaleString("fr-FR")}{counter.suffix}
      </p>
      <p className="text-sm text-[#2B2521]/55 mt-1">{counter.label}</p>
    </div>
  );
}

export function AnimatedCounters({
  nbChantiers,
  nbAvis,
  expYears,
  satisfaction,
  couleur,
  styleVariant,
}: {
  nbChantiers: number;
  nbAvis: number;
  expYears: number | null;
  satisfaction: number;
  couleur: string;
  styleVariant: "bande" | "cards";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const counters: Counter[] = [
    { label: "Chantiers réalisés", value: nbChantiers, suffix: "+", icon: "🏗️" },
    { label: "Avis clients", value: nbAvis, suffix: "", icon: "⭐" },
    ...(expYears !== null ? [{ label: "Ans d'expérience", value: expYears, suffix: " ans", icon: "📅" }] : []),
    { label: "Clients satisfaits", value: satisfaction, suffix: "%", icon: "✅" },
  ];

  if (styleVariant === "bande") {
    return (
      <div
        ref={ref}
        className="py-10"
        style={{ backgroundColor: couleur }}
      >
        <div className="max-w-3xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-white/20">
          {counters.map((c) => (
            <CounterItem key={c.label} counter={c} active={active} couleur={couleur} styleVariant="bande" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="max-w-3xl mx-auto px-5 py-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {counters.map((c) => (
          <CounterItem key={c.label} counter={c} active={active} couleur={couleur} styleVariant="cards" />
        ))}
      </div>
    </div>
  );
}
